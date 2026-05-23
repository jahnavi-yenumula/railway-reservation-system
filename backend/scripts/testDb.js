// Quick DB test - run with: node scripts/testDb.js
const { initializePool, executeQuery } = require('../config/db');
require('dotenv').config();

async function test() {
  await initializePool();

  console.log('\n--- Test 1: Train search NDLS->KNP (fixed bind vars) ---');
  try {
    const sql = `
      SELECT t.train_no, t.train_name, r_src.depart_time, r_dst.arrival_time
      FROM trains t
      JOIN routes r_src ON t.train_no = r_src.train_no AND r_src.stn_code = :src
      JOIN routes r_dst ON t.train_no = r_dst.train_no AND r_dst.stn_code = :dst
      WHERE r_src.sequence_num < r_dst.sequence_num
    `;
    const r = await executeQuery(sql, { src: 'NDLS', dst: 'KNP' });
    console.log('✅ Search result:', r.rows);
  } catch (e) { console.error('❌ FAIL:', e.message); }

  console.log('\n--- Test 2: Train search NDLS->HWH ---');
  try {
    const sql = `
      SELECT t.train_no, t.train_name, r_src.depart_time, r_dst.arrival_time
      FROM trains t
      JOIN routes r_src ON t.train_no = r_src.train_no AND r_src.stn_code = :src
      JOIN routes r_dst ON t.train_no = r_dst.train_no AND r_dst.stn_code = :dst
      WHERE r_src.sequence_num < r_dst.sequence_num
    `;
    const r = await executeQuery(sql, { src: 'NDLS', dst: 'HWH' });
    console.log('✅ Search result:', r.rows);
  } catch (e) { console.error('❌ FAIL:', e.message); }

  console.log('\n--- Test 3: Coach availability query ---');
  try {
    const sql = `
      SELECT c.coach_id, c.coach_label, c.class_type, c.total_seats,
        (c.total_seats - NVL(
          (SELECT COUNT(*) FROM tickets tk
           JOIN bookings bk ON tk.pnr_10 = bk.pnr_10
           WHERE tk.coach_id = c.coach_id
             AND bk.journey_date = TO_DATE(:jDate, 'YYYY-MM-DD')
             AND bk.train_no = c.train_no
             AND tk.status = 'CNF'), 0
        )) AS available_seats
      FROM coaches c WHERE c.train_no = :trainNo
    `;
    const r = await executeQuery(sql, { jDate: '2026-05-22', trainNo: '12302' });
    console.log('✅ Coaches:', r.rows);
  } catch (e) { console.error('❌ FAIL:', e.message); }

  process.exit(0);
}

test().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
