const express = require('express');
const router = express.Router();
const { getAdmissions, createAdmission, updateAdmission } = require('../controllers/admissionController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.route('/')
  .get(getAdmissions)
  .post(authorize('admin', 'receptionist'), createAdmission);
router.route('/:id')
  .put(authorize('admin', 'receptionist', 'doctor'), updateAdmission);

module.exports = router;