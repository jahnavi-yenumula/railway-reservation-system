// Admin Controller - Manage trains, stations, routes, coach_classes, train_composition, view all data
// Updated for schema v3.0: coaches table removed; use coach_classes + train_composition
const { executeQuery } = require('../config/db');

// POST /api/admin/train - Add a new train
const addTrain = async (req, res) => {
  const { train_no, train_name, train_type, active_days } = req.body;

  if (!train_no || !train_name || !train_type) {
    return res.status(400).json({ success: false, message: 'All train fields are required.' });
  }

  try {
    await executeQuery(
      `INSERT INTO trains (train_no, train_name, train_type, active_days)
       VALUES (:train_no, :train_name, :train_type, :active_days)`,
      {
        train_no,
        train_name,
        train_type,
        active_days: active_days || '1111111',
      }
    );
    res.status(201).json({ success: true, message: 'Train added successfully.' });
  } catch (err) {
    if (err.message.includes('ORA-00001')) {
      return res.status(409).json({ success: false, message: 'Train number already exists.' });
    }
    console.error('Add train error:', err.message);
    res.status(500).json({ success: false, message: 'Error adding train.' });
  }
};

// POST /api/admin/station - Add a new station
const addStation = async (req, res) => {
  const { stn_code, city, stn_name, state } = req.body;

  if (!stn_code || !city || !stn_name || !state) {
    return res.status(400).json({ success: false, message: 'Station code, city, name, and state are required.' });
  }

  try {
    await executeQuery(
      `INSERT INTO stations (stn_code, city, stn_name, state)
       VALUES (:stnCode, :stnCity, :stnName, :stnState)`,
      {
        stnCode: stn_code.toUpperCase(),
        stnCity: city,
        stnName: stn_name,
        stnState: state,
      }
    );
    res.status(201).json({ success: true, message: 'Station added successfully.' });
  } catch (err) {
    if (err.message.includes('ORA-00001')) {
      return res.status(409).json({ success: false, message: 'Station code already exists.' });
    }
    console.error('Add station error:', err.message);
    res.status(500).json({ success: false, message: 'Error adding station.' });
  }
};

// POST /api/admin/route - Add a route stop
// arrival_time and depart_time are now integers (minutes since midnight, 0-1439)
const addRoute = async (req, res) => {
  const { train_no, stn_code, arrival_time, depart_time, sequence_num, distance_from_source } = req.body;

  if (!train_no || !stn_code || !sequence_num) {
    return res.status(400).json({ success: false, message: 'Train no, station code, and sequence are required.' });
  }

  // Validate time values (must be 0-1439 or null)
  const arrMins = arrival_time !== '' && arrival_time !== null && arrival_time !== undefined ? parseInt(arrival_time) : null;
  const depMins = depart_time !== '' && depart_time !== null && depart_time !== undefined ? parseInt(depart_time) : null;

  if (arrMins !== null && (arrMins < 0 || arrMins > 1439)) {
    return res.status(400).json({ success: false, message: 'Arrival time must be 0-1439 (minutes since midnight).' });
  }
  if (depMins !== null && (depMins < 0 || depMins > 1439)) {
    return res.status(400).json({ success: false, message: 'Departure time must be 0-1439 (minutes since midnight).' });
  }

  try {
    await executeQuery(
      `INSERT INTO routes (train_no, stn_code, arrival_time, depart_time, sequence_num, distance_from_source)
       VALUES (:train_no, :stn_code, :arrival_time, :depart_time, :sequence_num, :distance_from_source)`,
      {
        train_no,
        stn_code,
        arrival_time: arrMins,
        depart_time: depMins,
        sequence_num,
        distance_from_source: distance_from_source || 0,
      }
    );
    res.status(201).json({ success: true, message: 'Route stop added successfully.' });
  } catch (err) {
    console.error('Add route error:', err.message);
    res.status(500).json({ success: false, message: 'Error adding route.' });
  }
};

// POST /api/admin/coach-class - Add a coach class to the catalog
const addCoachClass = async (req, res) => {
  const { class_code, class_name, total_seats, base_fare_multiplier } = req.body;

  if (!class_code || !class_name || !total_seats || !base_fare_multiplier) {
    return res.status(400).json({ success: false, message: 'All coach class fields are required.' });
  }

  try {
    await executeQuery(
      `INSERT INTO coach_classes (class_code, class_name, total_seats, base_fare_multiplier)
       VALUES (:classCode, :className, :totalSeats, :fareMultiplier)`,
      {
        classCode: class_code.toUpperCase(),
        className: class_name,
        totalSeats: total_seats,
        fareMultiplier: base_fare_multiplier,
      }
    );
    res.status(201).json({ success: true, message: 'Coach class added successfully.' });
  } catch (err) {
    if (err.message.includes('ORA-00001')) {
      return res.status(409).json({ success: false, message: 'Coach class code already exists.' });
    }
    console.error('Add coach class error:', err.message);
    res.status(500).json({ success: false, message: 'Error adding coach class.' });
  }
};

// POST /api/admin/train-composition - Assign a coach to a specific train run date
const addTrainComposition = async (req, res) => {
  const { train_no, run_date, coach_label, class_code } = req.body;

  if (!train_no || !run_date || !coach_label || !class_code) {
    return res.status(400).json({ success: false, message: 'All composition fields are required.' });
  }

  try {
    // Ensure train_instance exists for this run_date
    const instanceCheck = await executeQuery(
      `SELECT train_no FROM train_instances WHERE train_no = :trainNo AND run_date = TO_DATE(:runDate, 'YYYY-MM-DD')`,
      { trainNo: train_no, runDate: run_date }
    );
    if (instanceCheck.rows.length === 0) {
      await executeQuery(
        `INSERT INTO train_instances (train_no, run_date, status) VALUES (:trainNo, TO_DATE(:runDate, 'YYYY-MM-DD'), 'Scheduled')`,
        { trainNo: train_no, runDate: run_date }
      );
    }

    await executeQuery(
      `INSERT INTO train_composition (train_no, run_date, coach_label, class_code)
       VALUES (:trainNo, TO_DATE(:runDate, 'YYYY-MM-DD'), :coachLabel, :classCode)`,
      {
        trainNo: train_no,
        runDate: run_date,
        coachLabel: coach_label,
        classCode: class_code.toUpperCase(),
      }
    );
    res.status(201).json({ success: true, message: 'Train composition added successfully.' });
  } catch (err) {
    if (err.message.includes('ORA-00001')) {
      return res.status(409).json({ success: false, message: 'This coach label already exists for this train on this date.' });
    }
    console.error('Add train composition error:', err.message);
    res.status(500).json({ success: false, message: 'Error adding train composition.' });
  }
};

// GET /api/admin/coach-classes - Get all coach classes
const getCoachClasses = async (req, res) => {
  try {
    const result = await executeQuery('SELECT * FROM coach_classes ORDER BY class_code');
    res.json({ success: true, coachClasses: result.rows });
  } catch (err) {
    console.error('Get coach classes error:', err.message);
    res.status(500).json({ success: false, message: 'Error fetching coach classes.' });
  }
};

// GET /api/admin/bookings - View all bookings
const getAllBookings = async (req, res) => {
  try {
    const sql = `
      SELECT 
        b.pnr_10,
        b.user_id,
        u.first_name || ' ' || u.last_name AS passenger_name,
        u.email,
        b.train_no,
        t.train_name,
        TO_CHAR(b.journey_date, 'YYYY-MM-DD') AS journey_date,
        b.source_stn_code,
        b.destination_stn_code,
        b.quota,
        b.total_fare,
        b.status,
        TO_CHAR(b.booking_timestamp, 'YYYY-MM-DD HH24:MI') AS booked_on,
        p.payment_status
      FROM bookings b
      JOIN users u ON b.user_id = u.user_id
      JOIN trains t ON b.train_no = t.train_no
      LEFT JOIN payments p ON b.pnr_10 = p.pnr_10
      ORDER BY b.booking_timestamp DESC
    `;
    const result = await executeQuery(sql);
    res.json({ success: true, bookings: result.rows });
  } catch (err) {
    console.error('Admin get bookings error:', err.message);
    res.status(500).json({ success: false, message: 'Error fetching bookings.' });
  }
};

// GET /api/admin/users - View all users
const getAllUsers = async (req, res) => {
  try {
    const result = await executeQuery(
      `SELECT user_id, email, mobile, first_name, last_name, gender, role,
              TO_CHAR(dob, 'YYYY-MM-DD') AS dob,
              TO_CHAR(created_at, 'YYYY-MM-DD') AS created_at
       FROM users ORDER BY created_at DESC`
    );
    res.json({ success: true, users: result.rows });
  } catch (err) {
    console.error('Admin get users error:', err.message);
    res.status(500).json({ success: false, message: 'Error fetching users.' });
  }
};

// GET /api/admin/stats - Dashboard analytics
const getStats = async (req, res) => {
  try {
    const totalBookings = await executeQuery("SELECT COUNT(*) AS cnt FROM bookings WHERE status != 'Cancelled'");
    const totalUsers = await executeQuery('SELECT COUNT(*) AS cnt FROM users');
    const totalTrains = await executeQuery('SELECT COUNT(*) AS cnt FROM trains');
    const totalRevenue = await executeQuery("SELECT NVL(SUM(amount), 0) AS total FROM payments WHERE payment_status = 'Success'");

    res.json({
      success: true,
      stats: {
        totalBookings: totalBookings.rows[0].CNT,
        totalUsers: totalUsers.rows[0].CNT,
        totalTrains: totalTrains.rows[0].CNT,
        totalRevenue: totalRevenue.rows[0].TOTAL,
      },
    });
  } catch (err) {
    console.error('Admin stats error:', err.message);
    res.status(500).json({ success: false, message: 'Error fetching stats.' });
  }
};

module.exports = {
  addTrain,
  addStation,
  addRoute,
  addCoachClass,
  addTrainComposition,
  getCoachClasses,
  getAllBookings,
  getAllUsers,
  getStats,
};
