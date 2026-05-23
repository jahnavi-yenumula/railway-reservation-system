// Booking Controller - Create, View, Cancel bookings
const { executeQuery } = require('../config/db');
const generatePNR = require('../utils/generatePNR');
const { allocateSeats } = require('../utils/seatAllocator');
const { promoteWaitlist } = require('../utils/waitlistManager');

// POST /api/bookings/create
const createBooking = async (req, res) => {
  const { trainNo, journeyDate, coachId, passengers, totalFare } = req.body;
  const userId = req.user.userId;

  if (!trainNo || !journeyDate || !coachId || !passengers || passengers.length === 0) {
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

    // Allocate seats for all passengers
    const allocations = await allocateSeats(passengers, coachId, journeyDate, trainNo);

    // Determine booking status
    const allConfirmed = allocations.every(a => a.status === 'CNF');
    // Note: use bkgStatus to avoid :status reserved word issue
    const bkgStatus = allConfirmed ? 'Confirmed' : 'Waitlisted';

    // Insert booking record
    await executeQuery(
      `INSERT INTO bookings (pnr_10, user_id, journey_date, train_no, total_fare, status)
       VALUES (:pnr, :userId, TO_DATE(:journeyDate, 'YYYY-MM-DD'), :trainNo, :totalFare, :bkgStatus)`,
      { pnr, userId, journeyDate, trainNo, totalFare, bkgStatus }
    );

    // Insert ticket for each passenger
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      const alloc = allocations[i];

      // Use tktStatus and passName to avoid Oracle reserved words :status and :name
      await executeQuery(
        `INSERT INTO tickets (pnr_10, passenger_name, passenger_age, coach_id, seat_num, status, wl_number)
         VALUES (:pnr, :passName, :passAge, :coachId, :seatNum, :tktStatus, :wlNumber)`,
        {
          pnr,
          passName: p.passenger_name,
          passAge: p.passenger_age,
          coachId: alloc.coachId,
          seatNum: alloc.seatNum,
          tktStatus: alloc.status,
          wlNumber: alloc.wlNumber,
        }
      );
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully.',
      pnr,
      status: bkgStatus,
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
        TO_CHAR(b.booking_timestamp, 'YYYY-MM-DD HH24:MI') AS booked_on,
        t.train_no,
        t.train_name,
        t.train_type,
        s_src.stn_name AS from_station,
        s_dst.stn_name AS to_station,
        r_src.depart_time AS departure_time,
        r_dst.arrival_time AS arrival_time,
        (SELECT COUNT(*) FROM tickets tk WHERE tk.pnr_10 = b.pnr_10) AS passenger_count,
        p.payment_status
      FROM bookings b
      JOIN trains t ON b.train_no = t.train_no
      JOIN routes r_src ON t.train_no = r_src.train_no AND r_src.sequence_num = 1
      JOIN routes r_dst ON t.train_no = r_dst.train_no
        AND r_dst.sequence_num = (SELECT MAX(sequence_num) FROM routes WHERE train_no = t.train_no)
      JOIN stations s_src ON r_src.stn_code = s_src.stn_code
      JOIN stations s_dst ON r_dst.stn_code = s_dst.stn_code
      LEFT JOIN payments p ON b.pnr_10 = p.pnr_10
      WHERE b.user_id = :userId
      ORDER BY b.booking_timestamp DESC
    `;

    const result = await executeQuery(sql, { userId });
    res.json({ success: true, bookings: result.rows });
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
        TO_CHAR(b.booking_timestamp, 'YYYY-MM-DD HH24:MI') AS booked_on,
        t.train_no,
        t.train_name,
        t.train_type,
        s_src.stn_code AS from_code,
        s_dst.stn_code AS to_code,
        s_src.stn_name AS from_station,
        s_dst.stn_name AS to_station,
        s_src.city AS from_city,
        s_dst.city AS to_city,
        r_src.depart_time AS departure_time,
        r_dst.arrival_time AS arrival_time
      FROM bookings b
      JOIN trains t ON b.train_no = t.train_no
      JOIN routes r_src ON t.train_no = r_src.train_no AND r_src.sequence_num = 1
      JOIN routes r_dst ON t.train_no = r_dst.train_no
        AND r_dst.sequence_num = (SELECT MAX(sequence_num) FROM routes WHERE train_no = t.train_no)
      JOIN stations s_src ON r_src.stn_code = s_src.stn_code
      JOIN stations s_dst ON r_dst.stn_code = s_dst.stn_code
      WHERE b.pnr_10 = :pnr
    `;
    const bookingResult = await executeQuery(bookingSql, { pnr });

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const ticketSql = `
      SELECT 
        tk.ticket_id,
        tk.passenger_name,
        tk.passenger_age,
        tk.seat_num,
        tk.status,
        tk.wl_number,
        c.coach_label,
        c.class_type
      FROM tickets tk
      JOIN coaches c ON tk.coach_id = c.coach_id
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
      booking: bookingResult.rows[0],
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

    // Get confirmed tickets to free up seats
    const confirmedTickets = await executeQuery(
      `SELECT tk.ticket_id, tk.coach_id, tk.seat_num
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
        ticket.COACH_ID,
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
