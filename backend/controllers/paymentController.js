// Payment Controller - Process dummy payments
const { executeQuery } = require('../config/db');

// POST /api/payments/pay
const processPayment = async (req, res) => {
  const { pnr, paymentMethod, amount } = req.body;

  if (!pnr || !paymentMethod || !amount) {
    return res.status(400).json({ success: false, message: 'PNR, payment method, and amount are required.' });
  }

  try {
    // Check if booking exists and is pending
    const bookingResult = await executeQuery(
      'SELECT * FROM bookings WHERE pnr_10 = :pnr',
      { pnr }
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Check if payment already done
    const existingPayment = await executeQuery(
      'SELECT trans_id FROM payments WHERE pnr_10 = :pnr',
      { pnr }
    );

    if (existingPayment.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Payment already processed for this booking.' });
    }

    // Generate a unique transaction ID
    const transId = 'TXN_' + Date.now() + '_' + Math.floor(Math.random() * 10000);

    // Insert payment record
    await executeQuery(
      `INSERT INTO payments (trans_id, pnr_10, amount, payment_status, payment_method)
       VALUES (:transId, :pnr, :amount, 'Success', :paymentMethod)`,
      { transId, pnr, amount, paymentMethod }
    );

    // Update booking status to Confirmed after payment
    await executeQuery(
      `UPDATE bookings SET status = 'Confirmed' WHERE pnr_10 = :pnr AND status = 'Pending'`,
      { pnr }
    );

    res.json({
      success: true,
      message: 'Payment successful.',
      transId,
      pnr,
      amount,
      paymentMethod,
    });
  } catch (err) {
    console.error('Payment error:', err.message);
    res.status(500).json({ success: false, message: 'Error processing payment.' });
  }
};

// GET /api/payments/:pnr - Get payment details for a booking
const getPaymentDetails = async (req, res) => {
  const { pnr } = req.params;

  try {
    const result = await executeQuery(
      `SELECT trans_id, pnr_10, amount, payment_status, payment_method,
              TO_CHAR(paid_at, 'YYYY-MM-DD HH24:MI:SS') AS paid_at
       FROM payments WHERE pnr_10 = :pnr`,
      { pnr }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment not found.' });
    }

    res.json({ success: true, payment: result.rows[0] });
  } catch (err) {
    console.error('Get payment error:', err.message);
    res.status(500).json({ success: false, message: 'Error fetching payment.' });
  }
};

module.exports = { processPayment, getPaymentDetails };
