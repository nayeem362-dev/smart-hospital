const express = require('express');
const router = express.Router();
const { getAppointments, createAppointment, updateAppointment } = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.route('/')
  .get(getAppointments)
  .post(authorize('admin', 'receptionist', 'patient'), createAppointment);
router.route('/:id')
  .put(protect, updateAppointment);

module.exports = router;