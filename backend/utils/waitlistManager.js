// Waitlist Manager - promotes WL to CNF when a seat is freed
const { executeQuery } = require('../config/db');

async function promoteWaitlist(coachId, freedSeatNum, journeyDate, trainNo) {
  try {
    // Find the first waitlisted ticket for this coach/date/train
    const sql = `
      SELECT t.ticket_id, t.wl_number
      FROM tickets t
      JOIN bookings b ON t.pnr_10 = b.pnr_10
      WHERE t.coach_id = :coachId
        AND b.journey_date = TO_DATE(:jDate, 'YYYY-MM-DD')
        AND b.train_no = :trainNo
        AND t.status = 'WL'
      ORDER BY t.wl_number ASC
      FETCH FIRST 1 ROWS ONLY
    `;
    const result = await executeQuery(sql, { coachId, jDate: journeyDate, trainNo });

    if (result.rows.length > 0) {
      const ticketId = result.rows[0].TICKET_ID;

      // Promote to CNF
      await executeQuery(
        `UPDATE tickets SET status = 'CNF', seat_num = :seatNum, wl_number = 0
         WHERE ticket_id = :ticketId`,
        { seatNum: freedSeatNum, ticketId }
      );

      // Re-number remaining WL entries
      await executeQuery(
        `UPDATE tickets t SET t.wl_number = t.wl_number - 1
         WHERE t.coach_id = :coachId AND t.status = 'WL'
           AND t.pnr_10 IN (
             SELECT b.pnr_10 FROM bookings b
             WHERE b.journey_date = TO_DATE(:jDate, 'YYYY-MM-DD')
               AND b.train_no = :trainNo
           )`,
        { coachId, jDate: journeyDate, trainNo }
      );

      console.log(`✅ Promoted ticket ${ticketId} from WL to CNF, seat ${freedSeatNum}`);
    }
  } catch (err) {
    console.error('Waitlist promotion error:', err.message);
  }
}

module.exports = { promoteWaitlist };
