// Train Controller - Search, Details, Route
const { executeQuery } = require('../config/db');

// GET /api/trains/search?from=NDLS&to=HWH&date=2026-04-10
const searchTrains = async (req, res) => {
  const { from, to, date } = req.query;

  if (!from || !to || !date) {
    return res.status(400).json({ success: false, message: 'from, to, and date are required.' });
  }

  try {
    // Note: :from and :to are reserved words in Oracle — use :src and :dst instead
    const sql = `
      SELECT 
        t.train_no,
        t.train_name,
        t.train_type,
        r_src.depart_time AS departure_time,
        r_dst.arrival_time AS arrival_time,
        r_src.stn_code AS from_code,
        r_dst.stn_code AS to_code,
        s_src.stn_name AS from_station,
        s_dst.stn_name AS to_station,
        s_src.city AS from_city,
        s_dst.city AS to_city,
        (r_dst.distance_from_source - r_src.distance_from_source) AS distance_km
      FROM trains t
      JOIN routes r_src ON t.train_no = r_src.train_no AND r_src.stn_code = :src
      JOIN routes r_dst ON t.train_no = r_dst.train_no AND r_dst.stn_code = :dst
      JOIN stations s_src ON r_src.stn_code = s_src.stn_code
      JOIN stations s_dst ON r_dst.stn_code = s_dst.stn_code
      WHERE r_src.sequence_num < r_dst.sequence_num
    `;

    const result = await executeQuery(sql, { src: from, dst: to });

    if (result.rows.length === 0) {
      return res.json({ success: true, trains: [], message: 'No trains found for this route.' });
    }

    // For each train, get available coaches and seat counts
    const trainsWithSeats = await Promise.all(
      result.rows.map(async (train) => {
        const coachSql = `
          SELECT 
            c.coach_id,
            c.coach_label,
            c.class_type,
            c.total_seats,
            (c.total_seats - NVL(
              (SELECT COUNT(*) FROM tickets tk
               JOIN bookings bk ON tk.pnr_10 = bk.pnr_10
               WHERE tk.coach_id = c.coach_id
                 AND bk.journey_date = TO_DATE(:jDate, 'YYYY-MM-DD')
                 AND bk.train_no = c.train_no
                 AND tk.status = 'CNF'), 0
            )) AS available_seats
          FROM coaches c
          WHERE c.train_no = :trainNo
        `;
        const coachResult = await executeQuery(coachSql, {
          jDate: date,
          trainNo: train.TRAIN_NO,
        });

        return {
          ...train,
          coaches: coachResult.rows,
        };
      })
    );

    res.json({ success: true, trains: trainsWithSeats, date });
  } catch (err) {
    console.error('Train search error:', err.message);
    res.status(500).json({ success: false, message: 'Error searching trains.' });
  }
};

// GET /api/trains/:trainNo
const getTrainDetails = async (req, res) => {
  const { trainNo } = req.params;

  try {
    // Get basic train info
    const trainResult = await executeQuery(
      'SELECT * FROM trains WHERE train_no = :trainNo',
      { trainNo }
    );

    if (trainResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Train not found.' });
    }

    // Get full route with station details
    const routeSql = `
      SELECT 
        r.route_id,
        r.sequence_num,
        r.arrival_time,
        r.depart_time,
        r.distance_from_source,
        s.stn_code,
        s.stn_name,
        s.city
      FROM routes r
      JOIN stations s ON r.stn_code = s.stn_code
      WHERE r.train_no = :trainNo
      ORDER BY r.sequence_num
    `;
    const routeResult = await executeQuery(routeSql, { trainNo });

    // Get coaches
    const coachResult = await executeQuery(
      'SELECT * FROM coaches WHERE train_no = :trainNo ORDER BY coach_label',
      { trainNo }
    );

    res.json({
      success: true,
      train: trainResult.rows[0],
      route: routeResult.rows,
      coaches: coachResult.rows,
    });
  } catch (err) {
    console.error('Train details error:', err.message);
    res.status(500).json({ success: false, message: 'Error fetching train details.' });
  }
};

// GET /api/trains - Get all trains (for admin/listing)
const getAllTrains = async (req, res) => {
  try {
    const result = await executeQuery('SELECT * FROM trains ORDER BY train_no');
    res.json({ success: true, trains: result.rows });
  } catch (err) {
    console.error('Get all trains error:', err.message);
    res.status(500).json({ success: false, message: 'Error fetching trains.' });
  }
};

// GET /api/trains/stations - Get all stations
const getAllStations = async (req, res) => {
  try {
    const result = await executeQuery('SELECT * FROM stations ORDER BY city');
    res.json({ success: true, stations: result.rows });
  } catch (err) {
    console.error('Get stations error:', err.message);
    res.status(500).json({ success: false, message: 'Error fetching stations.' });
  }
};

module.exports = { searchTrains, getTrainDetails, getAllTrains, getAllStations };
