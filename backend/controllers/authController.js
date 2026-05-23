// Authentication Controller - Signup, Login, Profile
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/db');
require('dotenv').config();

// POST /api/auth/signup
const signup = async (req, res) => {
  const { first_name, last_name, email, mobile, dob, gender, password } = req.body;

  // Basic validation
  if (!first_name || !last_name || !email || !mobile || !dob || !gender || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  try {
    // Check if email already exists
    const emailCheck = await executeQuery(
      'SELECT user_id FROM users WHERE email = :email',
      { email }
    );
    if (emailCheck.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    // Check if mobile already exists
    const mobileCheck = await executeQuery(
      'SELECT user_id FROM users WHERE mobile = :mobile',
      { mobile }
    );
    if (mobileCheck.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Mobile number already registered.' });
    }

    // Hash the password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert new user into database
    await executeQuery(
      `INSERT INTO users (email, mobile, first_name, last_name, dob, gender, password_hash)
       VALUES (:email, :mobile, :first_name, :last_name, TO_DATE(:dob, 'YYYY-MM-DD'), :gender, :password_hash)`,
      { email, mobile, first_name, last_name, dob, gender, password_hash }
    );

    res.status(201).json({ success: true, message: 'Account created successfully. Please login.' });
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ success: false, message: 'Server error during signup.' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  try {
    // Find user by email
    const result = await executeQuery(
      'SELECT * FROM users WHERE email = :email',
      { email }
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = result.rows[0];

    // Compare password with stored hash
    const isMatch = await bcrypt.compare(password, user.PASSWORD_HASH);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.USER_ID,
        email: user.EMAIL,
        role: user.ROLE,
        name: `${user.FIRST_NAME} ${user.LAST_NAME}`,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        userId: user.USER_ID,
        email: user.EMAIL,
        name: `${user.FIRST_NAME} ${user.LAST_NAME}`,
        role: user.ROLE,
        mobile: user.MOBILE,
      },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

// GET /api/auth/profile (protected)
const getProfile = async (req, res) => {
  try {
    const result = await executeQuery(
      `SELECT user_id, email, mobile, first_name, last_name, 
              TO_CHAR(dob, 'YYYY-MM-DD') AS dob, gender, role, 
              TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
       FROM users WHERE user_id = :userId`,
      { userId: req.user.userId }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error('Profile error:', err.message);
    res.status(500).json({ success: false, message: 'Server error fetching profile.' });
  }
};

module.exports = { signup, login, getProfile };
