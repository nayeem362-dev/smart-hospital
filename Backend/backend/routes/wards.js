const express = require('express');
const router = express.Router();
const { getWards, createWard, updateWard, getWardStats } = require('../controllers/wardController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/stats', getWardStats);
router.route('/')
  .get(getWards)
  .post(authorize('admin'), createWard);
router.route('/:id')
  .put(authorize('admin'), updateWard);

module.exports = router;