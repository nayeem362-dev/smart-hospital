const express = require('express');
const router = express.Router();
const { getAdminDashboard } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/admin', authorize('admin'), getAdminDashboard);

module.exports = router;