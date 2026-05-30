// Booking Controller - Create, View, Cancel bookings
// Updated for schema v3.0:
//   - bookings now has source_stn_code, destination_stn_code, quota
//   - tickets now use composition_id (not coach_id), have passenger_gender, allocated_berth
//   - booking status values: 'Booked', 'Cancelled', 'Partially_Cancelled'
const { executeQuery } = require('../config/db');
const generatePNR = require('../utils/generatePNR');
const { allocateSeats } = require('../utils/seatAllocator');
const { promoteWaitlist } = require('../utils/waitlistManager');

// Helper: convert minutes-since-midnight to HH:MM string
function minsToTime(mins) {
  if (mins === null || mins === undefined) return null;
  const h = Math.floor(mins / 60).toString().padStart(2, '0');
  const m = (mins % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

// POST /api/bookings/create
const createBooking = async (req, res) => {
  const { trainNo, journeyDate, compositionId, sourceStnCode, destinationStnCode, quota, passengers, totalFare } = req.body;
  const userId = req.user.userId;

  if (!trainNo || !journeyDate || !compositionId || !sourceStnCode || !destinationStnCode || !passengers || passengers.length === 0) {
    return res.status(400).json({ success: false, message: 'All booking fields are required.' });
  }

  try {
    // Generate unique PNR
    let pnr;
    let pnrExists = true;
    while (pnrExists) {
      pnr = generatePNR();
      const check = await executeQuery(
        'SELECT pnr_10 FROM bookings WHERE pnr_10 = :pnr',
        { pnr }
      );
      pnrExists = check.rows.length > 0;
    }

    // Ensure train_instance exists for this run_date (auto-create if missing)
    const instanceCheck = await executeQuery(
      `SELECT train_no FROM train_instances WHERE train_no = :trainNo AND run_date = TO_DATE(:jDate, 'YYYY-MM-DD')`,
      { trainNo, jDate: journeyDate }
    );
    if (instanceCheck.rows.length === 0) {
      await executeQuery(
        `INSERT INTO train_instances (train_no, run_date, status) VALUES (:trainNo, TO_DATE(:jDate, 'YYYY-MM-DD'), 'Scheduled')`,
        { trainNo, jDate: journeyDate }
      );
    }

    // Allocate seats for all passengers using composition_id
    const allocations = await allocateSeats(passengers, compositionId, journeyDate, trainNo);

    // Insert booking record — status is always 'Booked' (schema constraint)
    await executeQuery(
      `INSERT INTO bookings (pnr_10, user_id, train_no, journey_date, source_stn_code, destination_stn_code, quota, total_fare, status)
       VALUES (:pnr, :userId, :trainNo, TO_DATE(:journeyDate, 'YYYY-MM-DD'), :srcStn, :dstStn, :quota, :totalFare, 'Booked')`,
      {
        pnr,
        userId,
        trainNo,
        journeyDate,
        srcStn: sourceStnCode,
        dstStn: destinationStnCode,
        quota: quota || 'GN',
        totalFare,
      }
    );

    // Insert ticket for each passenger
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      const alloc = allocations[i];

      await executeQuery(
        `INSERT INTO tickets (pnr_10, passenger_name, passenger_age, passenger_gender, composition_id, seat_num, allocated_berth, status, wl_number)
         VALUES (:pnr, :passName, :passAge, :passGender, :compId, :seatNum, :allocBerth, :tktStatus, :wlNumber)`,
        {
          pnr,
          passName: p.passenger_name,
          passAge: p.passenger_age,
          passGender: p.passenger_gender || 'Male',
          compId: alloc.compositionId,
          seatNum: alloc.seatNum,
          allocBerth: alloc.allocatedBerth || null,
          tktStatus: alloc.status,
          wlNumber: alloc.wlNumber,
        }
      );
    }

    const allConfirmed = allocations.every(a => a.status === 'CNF');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully.',
      pnr,
      status: 'Booked',
      allConfirmed,
      allocations,
    });
  } catch (err) {
    console.error('Create booking error:', err.message);
    res.status(500).json({ success: false, message: 'Error creating booking.' });
  }
};

// GET /api/bookings/my - Get all bookings for logged-in user
const getMyBookings = async (req, res) => {
  const userId = req.user.userId;

  try {
    const sql = `
      SELECT 
        b.pnr_10,
        TO_CHAR(b.journey_date, 'YYYY-MM-DD') AS journey_date,
        b.total_fare,
        b.status AS booking_status,
        b.quota,
        TO_CHAR(b.booking_timestamp, 'YYYY-MM-DD HH24:MI') AS booked_on,
        b.train_no,
        t.train_name,
        t.train_type,
        s_src.stn_name AS from_station,
        s_dst.stn_name AS to_station,
        s_src.city AS from_city,
        s_dst.city AS to_city,
        r_src.depart_time AS departure_time,
        r_dst.arrival_time AS arrival_time,
        (SELECT COUNT(*) FROM tickets tk WHERE tk.pnr_10 = b.pnr_10) AS passenger_count,
        p.payment_status
      FROM bookings b
      JOIN trains t ON b.train_no = t.train_no
      JOIN stations s_src ON b.source_stn_code = s_src.stn_code
      JOIN stations s_dst ON b.destination_stn_code = s_dst.stn_code
      JOIN routes r_src ON b.train_no = r_src.train_no AND b.source_stn_code = r_src.stn_code
      JOIN routes r_dst ON b.train_no = r_dst.train_no AND b.destination_stn_code = r_dst.stn_code
      LEFT JOIN payments p ON b.pnr_10 = p.pnr_10
      WHERE b.user_id = :userId
      ORDER BY b.booking_timestamp DESC
    `;

    const result = await executeQuery(sql, { userId });

    // Convert integer times to HH:MM
    const bookings = result.rows.map(b => ({
      ...b,
      DEPARTURE_TIME: minsToTime(b.DEPARTURE_TIME),
      ARRIVAL_TIME: minsToTime(b.ARRIVAL_TIME),
    }));

    res.json({ success: true, bookings });
  } catch (err) {
    console.error('Get bookings error:', err.message);
    res.status(500).json({ success: false, message: 'Error fetching bookings.' });
  }
};

// GET /api/bookings/:pnr - Get booking details by PNR
const getBookingByPNR = async (req, res) => {
  const { pnr } = req.params;

  try {
    const bookingSql = `
      SELECT 
        b.pnr_10,
        TO_CHAR(b.journey_date, 'YYYY-MM-DD') AS journey_date,
        b.total_fare,
        b.status AS booking_status,
        b.quota,
        TO_CHAR(b.booking_timestamp, 'YYYY-MM-DD HH24:MI') AS booked_on,
        b.train_no,
        t.train_name,
        t.train_type,
        b.source_stn_code AS from_code,
        b.destination_stn_code AS to_code,
        s_src.stn_name AS from_station,
        s_dst.stn_name AS to_station,
        s_src.city AS from_city,
        s_dst.city AS to_city,
        r_src.depart_time AS departure_time,
        r_dst.arrival_time AS arrival_time
      FROM bookings b
      JOIN trains t ON b.train_no = t.train_no
      JOIN stations s_src ON b.source_stn_code = s_src.stn_code
      JOIN stations s_dst ON b.destination_stn_code = s_dst.stn_code
      JOIN routes r_src ON b.train_no = r_src.train_no AND b.source_stn_code = r_src.stn_code
      JOIN routes r_dst ON b.train_no = r_dst.train_no AND b.destination_stn_code = r_dst.stn_code
      WHERE b.pnr_10 = :pnr
    `;
    const bookingResult = await executeQuery(bookingSql, { pnr });

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const booking = bookingResult.rows[0];
    booking.DEPARTURE_TIME = minsToTime(booking.DEPARTURE_TIME);
    booking.ARRIVAL_TIME = minsToTime(booking.ARRIVAL_TIME);

    // Get tickets with coach info via train_composition + coach_classes
    const ticketSql = `
      SELECT 
        tk.ticket_id,
        tk.passenger_name,
        tk.passenger_age,
        tk.passenger_gender,
        tk.seat_num,
        tk.allocated_berth,
        tk.status,
        tk.wl_number,
        tc.coach_label,
        cc.class_code,
        cc.class_name
      FROM tickets tk
      LEFT JOIN train_composition tc ON tk.composition_id = tc.composition_id
      LEFT JOIN coach_classes cc ON tc.class_code = cc.class_code
      WHERE tk.pnr_10 = :pnr
    `;
    const ticketResult = await executeQuery(ticketSql, { pnr });

    const paymentResult = await executeQuery(
      `SELECT trans_id, amount, payment_status, payment_method,
              TO_CHAR(paid_at, 'YYYY-MM-DD HH24:MI') AS paid_at
       FROM payments WHERE pnr_10 = :pnr`,
      { pnr }
    );

    res.json({
      success: true,
      booking,
      tickets: ticketResult.rows,
      payment: paymentResult.rows[0] || null,
    });
  } catch (err) {
    console.error('Get booking by PNR error:', err.message);
    res.status(500).json({ success: false, message: 'Error fetching booking.' });
  }
};

// PUT /api/bookings/cancel/:pnr
const cancelBooking = async (req, res) => {
  const { pnr } = req.params;
  const userId = req.user.userId;

  try {
    const bookingResult = await executeQuery(
      `SELECT b.pnr_10, b.train_no, b.status,
              TO_CHAR(b.journey_date, 'YYYY-MM-DD') AS journey_date_str
       FROM bookings b WHERE b.pnr_10 = :pnr AND b.user_id = :userId`,
      { pnr, userId }
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found or unauthorized.' });
    }

    const booking = bookingResult.rows[0];

    if (booking.STATUS === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled.' });
    }

    // Get confirmed tickets to free up seats (now uses composition_id)
    const confirmedTickets = await executeQuery(
      `SELECT tk.ticket_id, tk.composition_id, tk.seat_num
       FROM tickets tk WHERE tk.pnr_10 = :pnr AND tk.status = 'CNF'`,
      { pnr }
    );

    // Cancel the booking
    await executeQuery(
      `UPDATE bookings SET status = 'Cancelled' WHERE pnr_10 = :pnr`,
      { pnr }
    );

    // Cancel all tickets
    await executeQuery(
      `UPDATE tickets SET status = 'CAN' WHERE pnr_10 = :pnr`,
      { pnr }
    );

    // Promote waitlisted passengers for each freed seat
    for (const ticket of confirmedTickets.rows) {
      await promoteWaitlist(
        ticket.COMPOSITION_ID,
        ticket.SEAT_NUM,
        booking.JOURNEY_DATE_STR,
        booking.TRAIN_NO
      );
    }

    res.json({ success: true, message: 'Booking cancelled successfully.' });
  } catch (err) {
    console.error('Cancel booking error:', err.message);
    res.status(500).json({ success: false, message: 'Error cancelling booking.' });
  }
};

module.exports = { createBooking, getMyBookings, getBookingByPNR, cancelBooking };
