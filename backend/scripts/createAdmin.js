// Run this script once to create an admin user
// Usage: node scripts/createAdmin.js

const bcrypt = require('bcryptjs');
const { initializePool, executeQuery } = require('../config/db');
require('dotenv').config();

async function createAdmin() {
  await initializePool();

  const email = 'admin@railbook.in';
  const password = 'Admin@123';
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    // Check if admin already exists
    const existing = await executeQuery(
      'SELECT user_id FROM users WHERE email = :email',
      { email }
    );

    if (existing.rows.length > 0) {
      console.log('Admin user already exists.');
      process.exit(0);
    }

    await executeQuery(
      `INSERT INTO users (email, mobile, first_name, last_name, dob, gender, password_hash, role)
       VALUES (:email, '0000000000', 'Admin', 'RailBook', TO_DATE('1990-01-01','YYYY-MM-DD'), 'Male', :passwordHash, 'Admin')`,
      { email, passwordHash }
    );

    console.log('✅ Admin user created!');
    console.log('   Email   :', email);
    console.log('   Password:', password);
  } catch (err) {
    console.error('Error creating admin:', err.message);
  }
  process.exit(0);
}

createAdmin();
