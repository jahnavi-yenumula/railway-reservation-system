// User Controller - Profile update, Saved Passengers (master_passengers)
const { executeQuery } = require('../config/db');

// GET /api/users/passengers - Get saved passengers for logged-in user
const getSavedPassengers = async (req, res) => {
  const userId = req.user.userId;
  try {
    const result = await executeQuery(
      'SELECT * FROM master_passengers WHERE user_id = :userId ORDER BY mstr_pass_id',
      { userId }
    );
    res.json({ success: true, passengers: result.rows });
  } catch (err) {
    console.error('Get saved passengers error:', err.message);
    res.status(500).json({ success: false, message: 'Error fetching saved passengers.' });
  }
};

// POST /api/users/passengers - Add a saved passenger
// Note: :name is a reserved word in Oracle — use :passName instead
const addSavedPassenger = async (req, res) => {
  const userId = req.user.userId;
  const { name, age, gender, preferred_berth } = req.body;

  if (!name || !age || !gender) {
    return res.status(400).json({ success: false, message: 'Name, age, and gender are required.' });
  }

  // Validate berth code against schema constraint
  const validBerths = ['LB', 'MB', 'UB', 'SL', 'SU', 'WS'];
  const berth = preferred_berth && validBerths.includes(preferred_berth) ? preferred_berth : null;

  try {
    await executeQuery(
      `INSERT INTO master_passengers (user_id, name, age, gender, preferred_berth)
       VALUES (:userId, :passName, :passAge, :passGender, :prefBerth)`,
      {
        userId,
        passName: name,
        passAge: age,
        passGender: gender,
        prefBerth: berth,
      }
    );
    res.status(201).json({ success: true, message: 'Passenger saved successfully.' });
  } catch (err) {
    console.error('Add passenger error:', err.message);
    res.status(500).json({ success: false, message: 'Error saving passenger.' });
  }
};

// PUT /api/users/passengers/:id - Update a saved passenger
const updateSavedPassenger = async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;
  const { name, age, gender, preferred_berth } = req.body;

  // Validate berth code against schema constraint
  const validBerths = ['LB', 'MB', 'UB', 'SL', 'SU', 'WS'];
  const berth = preferred_berth && validBerths.includes(preferred_berth) ? preferred_berth : null;

  try {
    const result = await executeQuery(
      `UPDATE master_passengers
       SET name = :passName, age = :passAge, gender = :passGender, preferred_berth = :prefBerth
       WHERE mstr_pass_id = :passId AND user_id = :userId`,
      {
        passName: name,
        passAge: age,
        passGender: gender,
        prefBerth: berth,
        passId: id,
        userId,
      }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({ success: false, message: 'Passenger not found.' });
    }

    res.json({ success: true, message: 'Passenger updated successfully.' });
  } catch (err) {
    console.error('Update passenger error:', err.message);
    res.status(500).json({ success: false, message: 'Error updating passenger.' });
  }
};

// DELETE /api/users/passengers/:id - Delete a saved passenger
const deleteSavedPassenger = async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;

  try {
    const result = await executeQuery(
      'DELETE FROM master_passengers WHERE mstr_pass_id = :passId AND user_id = :userId',
      { passId: id, userId }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({ success: false, message: 'Passenger not found.' });
    }

    res.json({ success: true, message: 'Passenger deleted successfully.' });
  } catch (err) {
    console.error('Delete passenger error:', err.message);
    res.status(500).json({ success: false, message: 'Error deleting passenger.' });
  }
};

// PUT /api/users/profile - Update user profile
const updateProfile = async (req, res) => {
  const userId = req.user.userId;
  const { first_name, last_name, mobile } = req.body;

  try {
    await executeQuery(
      `UPDATE users SET first_name = :firstName, last_name = :lastName, mobile = :mobileNum
       WHERE user_id = :userId`,
      { firstName: first_name, lastName: last_name, mobileNum: mobile, userId }
    );
    res.json({ success: true, message: 'Profile updated successfully.' });
  } catch (err) {
    console.error('Update profile error:', err.message);
    res.status(500).json({ success: false, message: 'Error updating profile.' });
  }
};

module.exports = {
  getSavedPassengers,
  addSavedPassenger,
  updateSavedPassenger,
  deleteSavedPassenger,
  updateProfile,
};
