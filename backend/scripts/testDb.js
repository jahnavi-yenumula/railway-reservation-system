// Quick DB test - run with: node scripts/testDb.js
// Updated for schema v3.0: uses train_composition + coach_classes instead of coaches
const { initializePool, executeQuery } = require('../config/db');
require('dotenv').config();

async function test() {
  await initializePool();

  console.log('\n--- Test 1: Train search NDLS->KNP ---');
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

  console.log('\n--- Test 3: Train composition availability for 2026-04-10 ---');
  try {
    const sql = `
      SELECT tc.composition_id, tc.coach_label, tc.class_code,
             cc.class_name, cc.total_seats, cc.base_fare_multiplier,
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
    const r = await executeQuery(sql, { jDate: '2026-04-10', trainNo: '12302' });
    console.log('✅ Composition:', r.rows);
  } catch (e) { console.error('❌ FAIL:', e.message); }

  console.log('\n--- Test 4: Stations list ---');
  try {
    const r = await executeQuery('SELECT stn_code, city, stn_name, state FROM stations ORDER BY city');
    console.log('✅ Stations:', r.rows);
  } catch (e) { console.error('❌ FAIL:', e.message); }

  process.exit(0);
}

test().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
