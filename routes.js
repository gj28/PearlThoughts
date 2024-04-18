const express = require('express');
const doctorsController = require('./Controller');

const router = express.Router();

// Endpoint to get list of doctors
router.get('/doctors', doctorsController.getDoctors);

// Endpoint to get details of a specific doctor
router.get('/doctors/:id', doctorsController.getDoctorById);

// Endpoint to check availability of a doctor for a specific date and time
router.get('/doctorAvailability/:id', doctorsController.checkAvailability);

// Endpoint to book an appointment with a doctor
router.post('/bookAppointment/:id', doctorsController.bookAppointment);

module.exports = router;
