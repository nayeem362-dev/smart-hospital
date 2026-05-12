const express = require('express');
const router = express.Router();
const { getBills, getBill, createBill, makePayment, downloadBillPDF } = require('../controllers/billingController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.route('/')
  .get(getBills)
  .post(authorize('admin', 'receptionist'), createBill);
router.get('/:id', getBill);
router.post('/:id/pay', authorize('admin', 'receptionist'), makePayment);
router.get('/:id/pdf', downloadBillPDF);

module.exports = router;