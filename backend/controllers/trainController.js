// Train Controller - Search, Details, Route
// Updated for schema v3.0: coach_classes + train_composition replace coaches table
// Times are now integers (minutes since midnight), not time strings
const { executeQuery } = require('../config/db');

// Helper: convert minutes-since-midnight to HH:MM string
function minsToTime(mins) {
  if (mins === null || mins === undefined) return null;
  const h = Math.floor(mins / 60).toString().padStart(2, '0');
  const m = (mins % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

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
        t.active_days,
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

    // For each train, get available coach classes from train_composition for that run_date
    const trainsWithSeats = await Promise.all(
      result.rows.map(async (train) => {
        // Convert integer times to HH:MM strings
        const trainFormatted = {
          ...train,
          DEPARTURE_TIME: minsToTime(train.DEPARTURE_TIME),
          ARRIVAL_TIME: minsToTime(train.ARRIVAL_TIME),
        };

        // Get coach classes available for this train on this date via train_composition
        const coachSql = `
          SELECT 
            tc.composition_id,
            tc.coach_label,
            tc.class_code,
            cc.class_name,
            cc.total_seats,
            cc.base_fare_multiplier,
            (cc.total_seats - NVL(
              (SELECT COUNT(*) FROM tickets tk
               JOIN bookings bk ON tk.pnr_10 = bk.pnr_10
               WHERE tk.composition_id = tc.composition_id
                 AND bk.journey_date = TO_DATE(:jDate, 'YYYY-MM-DD')
                 AND bk.train_no = tc.train_no
                 AND tk.status IN ('CNF', 'RAC')), 0
            )) AS available_seats
          FROM train_composition tc
          JOIN coach_classes cc ON tc.class_code = cc.class_code
          WHERE tc.train_no = :trainNo
            AND tc.run_date = TO_DATE(:jDate, 'YYYY-MM-DD')
        `;
        const coachResult = await executeQuery(coachSql, {
          jDate: date,
          trainNo: train.TRAIN_NO,
        });

        return {
          ...trainFormatted,
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

    // Get full route with station details; convert integer times to HH:MM
    const routeSql = `
      SELECT 
        r.route_id,
        r.sequence_num,
        r.arrival_time,
        r.depart_time,
        r.distance_from_source,
        s.stn_code,
        s.stn_name,
        s.city,
        s.state
      FROM routes r
      JOIN stations s ON r.stn_code = s.stn_code
      WHERE r.train_no = :trainNo
      ORDER BY r.sequence_num
    `;
    const routeResult = await executeQuery(routeSql, { trainNo });

    // Format times in route
    const routeFormatted = routeResult.rows.map(r => ({
      ...r,
      ARRIVAL_TIME: minsToTime(r.ARRIVAL_TIME),
      DEPART_TIME: minsToTime(r.DEPART_TIME),
    }));

    // Get coach classes from coach_classes catalog (static reference)
    const coachResult = await executeQuery(
      `SELECT cc.class_code, cc.class_name, cc.total_seats, cc.base_fare_multiplier
       FROM coach_classes cc
       WHERE cc.class_code IN (
         SELECT DISTINCT tc.class_code FROM train_composition tc WHERE tc.train_no = :trainNo
       )
       ORDER BY cc.class_code`,
      { trainNo }
    );

    res.json({
      success: true,
      train: trainResult.rows[0],
      route: routeFormatted,
      coaches: coachResult.rows,
    });
  } catch (err) {
    console.error('Train details error:', err.message);
    res.status(500).json({ success: false, message: 'Error fetching train details.' });
  }
};

// GET /api/trains/:trainNo/coaches?date=2026-04-10
// Returns train_composition for the given date.
// If no composition exists for that date, auto-creates it by copying the latest available run.
const getCoachesForDate = async (req, res) => {
  const { trainNo } = req.params;
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ success: false, message: 'date query param is required.' });
  }

  try {
    const coachSql = `
      SELECT 
        tc.composition_id,
        tc.coach_label,
        tc.class_code,
        cc.class_name,
        cc.total_seats,
        cc.base_fare_multiplier,
        (cc.total_seats - NVL(
          (SELECT COUNT(*) FROM tickets tk
           JOIN bookings bk ON tk.pnr_10 = bk.pnr_10
           WHERE tk.composition_id = tc.composition_id
             AND bk.journey_date = TO_DATE(:jDate, 'YYYY-MM-DD')
             AND bk.train_no = tc.train_no
             AND tk.status IN ('CNF', 'RAC')), 0
        )) AS available_seats
      FROM train_composition tc
      JOIN coach_classes cc ON tc.class_code = cc.class_code
      WHERE tc.train_no = :trainNo
        AND tc.run_date = TO_DATE(:jDate, 'YYYY-MM-DD')
    `;

    let coachResult = await executeQuery(coachSql, { jDate: date, trainNo });

    // If no composition for this date, auto-create from the most recent run
    if (coachResult.rows.length === 0) {
      // Find the most recent run_date that has composition data
      const latestRun = await executeQuery(
        `SELECT run_date FROM train_instances
         WHERE train_no = :trainNo
         ORDER BY run_date DESC
         FETCH FIRST 1 ROWS ONLY`,
        { trainNo }
      );

      if (latestRun.rows.length > 0) {
        const sourceDate = latestRun.rows[0].RUN_DATE;

        // Ensure train_instance exists for the requested date
        const instanceCheck = await executeQuery(
          `SELECT train_no FROM train_instances
           WHERE train_no = :trainNo AND run_date = TO_DATE(:jDate, 'YYYY-MM-DD')`,
          { trainNo, jDate: date }
        );
        if (instanceCheck.rows.length === 0) {
          await executeQuery(
            `INSERT INTO train_instances (train_no, run_date, status)
             VALUES (:trainNo, TO_DATE(:jDate, 'YYYY-MM-DD'), 'Scheduled')`,
            { trainNo, jDate: date }
          );
        }

        // Copy composition from source date to requested date
        const sourceComps = await executeQuery(
          `SELECT coach_label, class_code FROM train_composition
           WHERE train_no = :trainNo AND run_date = :srcDate`,
          { trainNo, srcDate: sourceDate }
        );

        for (const comp of sourceComps.rows) {
          // Insert only if not already there (avoid duplicate key error)
          const exists = await executeQuery(
            `SELECT composition_id FROM train_composition
             WHERE train_no = :trainNo
               AND run_date = TO_DATE(:jDate, 'YYYY-MM-DD')
               AND coach_label = :coachLabel`,
            { trainNo, jDate: date, coachLabel: comp.COACH_LABEL }
          );
          if (exists.rows.length === 0) {
            await executeQuery(
              `INSERT INTO train_composition (train_no, run_date, coach_label, class_code)
               VALUES (:trainNo, TO_DATE(:jDate, 'YYYY-MM-DD'), :coachLabel, :classCode)`,
              { trainNo, jDate: date, coachLabel: comp.COACH_LABEL, classCode: comp.CLASS_CODE }
            );
          }
        }

        // Fetch the newly created composition
        coachResult = await executeQuery(coachSql, { jDate: date, trainNo });
      }
    }

    res.json({ success: true, coaches: coachResult.rows });
  } catch (err) {
    console.error('Get coaches for date error:', err.message);
    res.status(500).json({ success: false, message: 'Error fetching coaches.' });
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

module.exports = { searchTrains, getTrainDetails, getCoachesForDate, getAllTrains, getAllStations };
