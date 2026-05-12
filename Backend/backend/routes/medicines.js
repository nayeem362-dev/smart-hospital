const express = require('express');
const router = express.Router();
const { getMedicines, createMedicine, updateMedicine, deleteMedicine } = require('../controllers/medicineController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.route('/')
  .get(getMedicines)
  .post(authorize('admin'), createMedicine);
router.route('/:id')
  .put(authorize('admin'), updateMedicine)
  .delete(authorize('admin'), deleteMedicine);

module.exports = router;