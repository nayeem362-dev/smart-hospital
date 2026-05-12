const express = require('express');
const router = express.Router();
const { getDischarges, createDischarge } = require('../controllers/dischargeController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.route('/')
  .get(getDischarges)
  .post(authorize('admin', 'doctor', 'receptionist'), createDischarge);

module.exports = router;