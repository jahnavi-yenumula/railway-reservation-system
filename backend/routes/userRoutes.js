const express = require('express');
const router = express.Router();
const {
  getSavedPassengers,
  addSavedPassenger,
  updateSavedPassenger,
  deleteSavedPassenger,
  updateProfile,
} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// All user routes require authentication
router.get('/passengers', authMiddleware, getSavedPassengers);
router.post('/passengers', authMiddleware, addSavedPassenger);
router.put('/passengers/:id', authMiddleware, updateSavedPassenger);
router.delete('/passengers/:id', authMiddleware, deleteSavedPassenger);
router.put('/profile', authMiddleware, updateProfile);

module.exports = router;
