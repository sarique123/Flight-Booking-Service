const express = require('express');
const router = express.Router();
const {BookingController} = require('../../controllers');

// /api/v1/
router.post('/',BookingController.createBooking);

module.exports = router;