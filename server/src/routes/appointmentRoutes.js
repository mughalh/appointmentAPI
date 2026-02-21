const express = require('express');
const router = express.Router();
const {
  getAllAppointments,
  getMyAppointments,
  getProviderAppointments,
  createAppointment,
  updateAppointmentStatus,
  cancelAppointment,
  getAppointmentById
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');
const { appointmentValidation } = require('../middleware/validation');

router.use(protect);

// Customer routes
router.get('/my-appointments', getMyAppointments);
router.post('/', appointmentValidation.create, createAppointment);

// Provider routes
router.get('/provider', authorize('PROVIDER'), getProviderAppointments);

// Admin routes
router.get('/', authorize('ADMIN'), getAllAppointments);

// Common routes
router.get('/:id', getAppointmentById);
router.patch('/:id/status', updateAppointmentStatus);
router.patch('/:id/cancel', cancelAppointment);

module.exports = router;