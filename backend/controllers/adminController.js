// Admin Controller - Manage trains, stations, routes, coaches, view all data
const { executeQuery } = require('../config/db');

// POST /api/admin/train - Add a new train
const addTrain = async (req, res) => {
  const { train_no, train_name, train_type } = req.body;

  if (!train_no || !train_name || !train_type) {
    return res.status(400).json({ success: false, message: 'All train fields are required.' });
  }

  try {
    await executeQuery(
      'INSERT INTO trains (train_no, train_name, train_type) VALUES (:train_no, :train_name, :train_type)',
      { train_no, train_name, train_type }
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
  const { stn_code, city, stn_name } = req.body;

  if (!stn_code || !city || !stn_name) {
    return res.status(400).json({ success: false, message: 'All station fields are required.' });
  }

  try {
    await executeQuery(
      'INSERT INTO stations (stn_code, city, stn_name) VALUES (:stnCode, :stnCity, :stnName)',
      { stnCode: stn_code.toUpperCase(), stnCity: city, stnName: stn_name }
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
const addRoute = async (req, res) => {
  const { train_no, stn_code, arrival_time, depart_time, sequence_num, distance_from_source } = req.body;

  if (!train_no || !stn_code || !sequence_num) {
    return res.status(400).json({ success: false, message: 'Train no, station code, and sequence are required.' });
  }

  try {
    await executeQuery(
      `INSERT INTO routes (train_no, stn_code, arrival_time, depart_time, sequence_num, distance_from_source)
       VALUES (:train_no, :stn_code, :arrival_time, :depart_time, :sequence_num, :distance_from_source)`,
      {
        train_no,
        stn_code,
        arrival_time: arrival_time || null,
        depart_time: depart_time || null,
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

// POST /api/admin/coach - Add a coach to a train
const addCoach = async (req, res) => {
  const { train_no, coach_label, class_type, total_seats } = req.body;

  if (!train_no || !coach_label || !class_type || !total_seats) {
    return res.status(400).json({ success: false, message: 'All coach fields are required.' });
  }

  try {
    await executeQuery(
      `INSERT INTO coaches (train_no, coach_label, class_type, total_seats)
       VALUES (:train_no, :coach_label, :class_type, :total_seats)`,
      { train_no, coach_label, class_type, total_seats }
    );
    res.status(201).json({ success: true, message: 'Coach added successfully.' });
  } catch (err) {
    console.error('Add coach error:', err.message);
    res.status(500).json({ success: false, message: 'Error adding coach.' });
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

module.exports = { addTrain, addStation, addRoute, addCoach, getAllBookings, getAllUsers, getStats };
