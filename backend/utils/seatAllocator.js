// Seat Allocation Logic
// Note: Oracle reserved words cannot be used as bind variable names.
// Avoid :from, :to, :date, :status, :name, :level, :type etc.

const { executeQuery } = require('../config/db');

/**
 * Get the next available seat in a coach for a given journey date
 */
async function getNextAvailableSeat(coachId, journeyDate, trainNo) {
  const sql = `
    SELECT t.seat_num
    FROM tickets t
    JOIN bookings b ON t.pnr_10 = b.pnr_10
    WHERE t.coach_id = :coachId
      AND b.journey_date = TO_DATE(:jDate, 'YYYY-MM-DD')
      AND b.train_no = :trainNo
      AND t.status = 'CNF'
    ORDER BY t.seat_num
  `;
  const result = await executeQuery(sql, { coachId, jDate: journeyDate, trainNo });
  const bookedSeats = result.rows.map(r => r.SEAT_NUM);

  // Get total seats in this coach
  const coachResult = await executeQuery(
    'SELECT total_seats FROM coaches WHERE coach_id = :coachId',
    { coachId }
  );
  if (!coachResult.rows.length) return null;

  const totalSeats = coachResult.rows[0].TOTAL_SEATS;

  // Find the first available seat number
  for (let seat = 1; seat <= totalSeats; seat++) {
    if (!bookedSeats.includes(seat)) {
      return seat;
    }
  }
  return null; // No seat available
}

/**
 * Get the next waitlist number for a coach on a given date
 */
async function getNextWaitlistNumber(coachId, journeyDate, trainNo) {
  const sql = `
    SELECT MAX(t.wl_number) AS max_wl
    FROM tickets t
    JOIN bookings b ON t.pnr_10 = b.pnr_10
    WHERE t.coach_id = :coachId
      AND b.journey_date = TO_DATE(:jDate, 'YYYY-MM-DD')
      AND b.train_no = :trainNo
      AND t.status = 'WL'
  `;
  const result = await executeQuery(sql, { coachId, jDate: journeyDate, trainNo });
  const maxWL = result.rows[0].MAX_WL || 0;
  return maxWL + 1;
}

/**
 * Allocate seats for multiple passengers
 */
async function allocateSeats(passengers, coachId, journeyDate, trainNo) {
  const allocations = [];

  for (let i = 0; i < passengers.length; i++) {
    const seatNum = await getNextAvailableSeat(coachId, journeyDate, trainNo);

    if (seatNum !== null) {
      allocations.push({ seatNum, status: 'CNF', wlNumber: 0, coachId });
    } else {
      const wlNumber = await getNextWaitlistNumber(coachId, journeyDate, trainNo);
      allocations.push({ seatNum: null, status: 'WL', wlNumber, coachId });
    }
  }

  return allocations;
}

module.exports = { allocateSeats, getNextAvailableSeat, getNextWaitlistNumber };
