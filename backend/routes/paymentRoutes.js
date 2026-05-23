const express = require('express');
const router = express.Router();
const { processPayment, getPaymentDetails } = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/pay', authMiddleware, processPayment);
router.get('/:pnr', authMiddleware, getPaymentDetails);

module.exports = router;
