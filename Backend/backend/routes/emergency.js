const express = require('express');
const router = express.Router();
const { getEmergencyCases, createEmergencyCase, updateEmergencyCase } = require('../controllers/emergencyController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.route('/')
  .get(getEmergencyCases)
  .post(authorize('admin', 'receptionist', 'doctor', 'nurse'), createEmergencyCase);
router.route('/:id')
  .put(authorize('admin', 'doctor', 'nurse'), updateEmergencyCase);

module.exports = router;