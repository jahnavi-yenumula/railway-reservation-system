const express = require('express');
const router = express.Router();
const {
  addTrain,
  addStation,
  addRoute,
  addCoachClass,
  addTrainComposition,
  getCoachClasses,
  getAllBookings,
  getAllUsers,
  getStats,
} = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// All admin routes require auth + admin role
router.use(authMiddleware, adminMiddleware);

router.post('/train', addTrain);
router.post('/station', addStation);
router.post('/route', addRoute);
router.post('/coach-class', addCoachClass);          // replaces /coach
router.post('/train-composition', addTrainComposition); // new: assign coach to run date
router.get('/coach-classes', getCoachClasses);
router.get('/bookings', getAllBookings);
router.get('/users', getAllUsers);
router.get('/stats', getStats);

module.exports = router;
