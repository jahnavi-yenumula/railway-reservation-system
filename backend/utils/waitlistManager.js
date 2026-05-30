// Waitlist Manager - promotes WL to CNF when a seat is freed
// Updated for schema v3.0: uses composition_id instead of coach_id
const { executeQuery } = require('../config/db');

async function promoteWaitlist(compositionId, freedSeatNum, journeyDate, trainNo) {
  try {
    // Find the first waitlisted ticket for this composition/date/train
    const sql = `
      SELECT t.ticket_id, t.wl_number
      FROM tickets t
      JOIN bookings b ON t.pnr_10 = b.pnr_10
      WHERE t.composition_id = :compId
        AND b.journey_date = TO_DATE(:jDate, 'YYYY-MM-DD')
        AND b.train_no = :trainNo
        AND t.status = 'WL'
      ORDER BY t.wl_number ASC
      FETCH FIRST 1 ROWS ONLY
    `;
    const result = await executeQuery(sql, { compId: compositionId, jDate: journeyDate, trainNo });

    if (result.rows.length > 0) {
      const ticketId = result.rows[0].TICKET_ID;

      // Promote to CNF
      await executeQuery(
        `UPDATE tickets SET status = 'CNF', seat_num = :seatNum, wl_number = 0
         WHERE ticket_id = :ticketId`,
        { seatNum: freedSeatNum, ticketId }
      );

      // Re-number remaining WL entries for this composition
      await executeQuery(
        `UPDATE tickets t SET t.wl_number = t.wl_number - 1
         WHERE t.composition_id = :compId AND t.status = 'WL'
           AND t.pnr_10 IN (
             SELECT b.pnr_10 FROM bookings b
             WHERE b.journey_date = TO_DATE(:jDate, 'YYYY-MM-DD')
               AND b.train_no = :trainNo
           )`,
        { compId: compositionId, jDate: journeyDate, trainNo }
      );

      console.log(`✅ Promoted ticket ${ticketId} from WL to CNF, seat ${freedSeatNum}`);
    }
  } catch (err) {
    console.error('Waitlist promotion error:', err.message);
  }
}

module.exports = { promoteWaitlist };
