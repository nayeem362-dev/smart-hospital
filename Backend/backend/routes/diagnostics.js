const express = require('express');
const router = express.Router();
const { getDiagnostics, createDiagnostic, updateDiagnostic } = require('../controllers/diagnosticController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.route('/')
  .get(getDiagnostics)
  .post(authorize('admin', 'doctor', 'diagnostic_staff', 'receptionist'), createDiagnostic);
router.route('/:id')
  .put(authorize('admin', 'diagnostic_staff', 'doctor'), updateDiagnostic);

module.exports = router;