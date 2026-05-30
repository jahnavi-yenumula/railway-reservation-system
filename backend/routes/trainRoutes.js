const express = require('express');
const router = express.Router();
const { searchTrains, getTrainDetails, getAllTrains, getAllStations, getCoachesForDate } = require('../controllers/trainController');

router.get('/search', searchTrains);
router.get('/stations', getAllStations);
router.get('/', getAllTrains);
router.get('/:trainNo/coaches', getCoachesForDate);  // coaches for a specific date
router.get('/:trainNo', getTrainDetails);

module.exports = router;
