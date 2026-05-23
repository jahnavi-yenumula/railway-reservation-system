const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, getBookingByPNR, cancelBooking } = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');

// All booking routes require authentication
router.post('/create', authMiddleware, createBooking);
router.get('/my', authMiddleware, getMyBookings);
router.get('/:pnr', authMiddleware, getBookingByPNR);
router.put('/cancel/:pnr', authMiddleware, cancelBooking);

module.exports = router;
