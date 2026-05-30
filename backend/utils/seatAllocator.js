// Seat Allocation Logic
// Updated for schema v3.0: uses composition_id (from train_composition) instead of coach_id
// Oracle reserved words cannot be used as bind variable names.
// Avoid :from, :to, :date, :status, :name, :level, :type etc.

const { executeQuery } = require('../config/db');

/**
 * Get the next available seat in a composition (coach on a specific run date)
 */
async function getNextAvailableSeat(compositionId, journeyDate, trainNo) {
  const sql = `
    SELECT t.seat_num
    FROM tickets t
    JOIN bookings b ON t.pnr_10 = b.pnr_10
    WHERE t.composition_id = :compId
      AND b.journey_date = TO_DATE(:jDate, 'YYYY-MM-DD')
      AND b.train_no = :trainNo
      AND t.status IN ('CNF', 'RAC')
    ORDER BY t.seat_num
  `;
  const result = await executeQuery(sql, { compId: compositionId, jDate: journeyDate, trainNo });
  const bookedSeats = result.rows.map(r => r.SEAT_NUM);

  // Get total seats from coach_classes via train_composition
  const coachResult = await executeQuery(
    `SELECT cc.total_seats
     FROM train_composition tc
     JOIN coach_classes cc ON tc.class_code = cc.class_code
     WHERE tc.composition_id = :compId`,
    { compId: compositionId }
  );
  if (!coachResult.rows.length) return null;

  const totalSeats = coachResult.rows[0].TOTAL_SEATS;

  // Find the first available seat number
  for (let seat = 1; seat <= totalSeats; seat++) {
    if (!bookedSeats.includes(seat)) {
      return seat;
    }
  }
  return null; // No seat available — go to waitlist
}

/**
 * Get the next waitlist number for a composition on a given date
 */
async function getNextWaitlistNumber(compositionId, journeyDate, trainNo) {
  const sql = `
    SELECT MAX(t.wl_number) AS max_wl
    FROM tickets t
    JOIN bookings b ON t.pnr_10 = b.pnr_10
    WHERE t.composition_id = :compId
      AND b.journey_date = TO_DATE(:jDate, 'YYYY-MM-DD')
      AND b.train_no = :trainNo
      AND t.status = 'WL'
  `;
  const result = await executeQuery(sql, { compId: compositionId, jDate: journeyDate, trainNo });
  const maxWL = result.rows[0].MAX_WL || 0;
  return maxWL + 1;
}

/**
 * Allocate seats for multiple passengers
 * Returns array of allocation objects with compositionId, seatNum, status, wlNumber
 */
async function allocateSeats(passengers, compositionId, journeyDate, trainNo) {
  const allocations = [];

  for (let i = 0; i < passengers.length; i++) {
    const seatNum = await getNextAvailableSeat(compositionId, journeyDate, trainNo);

    if (seatNum !== null) {
      allocations.push({ compositionId, seatNum, status: 'CNF', wlNumber: 0, allocatedBerth: null });
    } else {
      const wlNumber = await getNextWaitlistNumber(compositionId, journeyDate, trainNo);
      allocations.push({ compositionId, seatNum: null, status: 'WL', wlNumber, allocatedBerth: null });
    }
  }

  return allocations;
}

module.exports = { allocateSeats, getNextAvailableSeat, getNextWaitlistNumber };
