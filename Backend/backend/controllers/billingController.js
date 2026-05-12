const PDFDocument = require('pdfkit');
const { Bill, Payment, Patient, Admission } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');
const { generateId, paginate } = require('../utils/helpers');

const getBills = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, patientId } = req.query;
  const { offset, limit: lim } = paginate(page, limit);
  const where = {};
  if (status) where.status = status;
  if (patientId) where.patientId = patientId;
  const { count, rows } = await Bill.findAndCountAll({
    where,
    include: [{ model: Patient, as: 'patient', attributes: ['name', 'patientId', 'phone'] }],
    limit: lim, offset,
    order: [['createdAt', 'DESC']],
  });
  res.json({ success: true, data: rows, pagination: { total: count, page: +page, pages: Math.ceil(count / lim) } });
});

const createBill = asyncHandler(async (req, res) => {
  const { patientId, items, discount = 0, tax = 0, billType, notes, admissionId } = req.body;
  const subtotal = (items || []).reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const totalAmount = subtotal - parseFloat(discount) + (subtotal * parseFloat(tax) / 100);
  const bill = await Bill.create({
    billNumber: generateId('BILL'),
    patientId, admissionId, billType,
    items, subtotal, discount, tax,
    totalAmount, dueAmount: totalAmount,
    paidAmount: 0, status: 'pending',
    notes, generatedBy: req.user.id,
  });
  res.status(201).json({ success: true, message: 'Bill created', data: bill });
});

const getBill = asyncHandler(async (req, res) => {
  const bill = await Bill.findByPk(req.params.id, {
    include: [
      { model: Patient, as: 'patient' },
      { model: Payment, as: 'payments' },
    ],
  });
  if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
  res.json({ success: true, data: bill });
});

const makePayment = asyncHandler(async (req, res) => {
  const bill = await Bill.findByPk(req.params.id);
  if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
  const { amount, paymentMethod = 'cash', transactionRef } = req.body;
  const payment = await Payment.create({
    paymentId: generateId('PAY'),
    billId: bill.id,
    patientId: bill.patientId,
    amount, paymentMethod, transactionRef,
    status: 'completed',
    receivedBy: req.user.id,
  });
  const newPaid = parseFloat(bill.paidAmount) + parseFloat(amount);
  const newDue = parseFloat(bill.totalAmount) - newPaid;
  const status = newDue <= 0 ? 'paid' : 'partial';
  await bill.update({ paidAmount: newPaid, dueAmount: Math.max(0, newDue), status });
  res.json({ success: true, message: 'Payment recorded', data: { payment, bill } });
});

const downloadBillPDF = asyncHandler(async (req, res) => {
  const bill = await Bill.findByPk(req.params.id, {
    include: [{ model: Patient, as: 'patient' }],
  });
  if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${bill.billNumber}.pdf`);
  doc.pipe(res);
  doc.fontSize(22).fillColor('#1e40af').text('Smart Hospital Management System', { align: 'center' });
  doc.fontSize(10).fillColor('#6b7280').text('Dhaka, Bangladesh | +880 1700-000000', { align: 'center' });
  doc.moveDown();
  doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e5e7eb').stroke();
  doc.moveDown(0.5);
  doc.fontSize(18).fillColor('#111827').text('INVOICE', { align: 'center' });
  doc.moveDown(0.5);
  const infoY = doc.y;
  doc.fontSize(10).fillColor('#374151');
  doc.text(`Invoice #: ${bill.billNumber}`, 50, infoY);
  doc.text(`Date: ${new Date(bill.createdAt).toLocaleDateString()}`, 50, infoY + 15);
  doc.text(`Status: ${bill.status.toUpperCase()}`, 50, infoY + 30);
  doc.text(`Patient: ${bill.patient?.name || 'N/A'}`, 350, infoY);
  doc.text(`Patient ID: ${bill.patient?.patientId || 'N/A'}`, 350, infoY + 15);
  doc.text(`Phone: ${bill.patient?.phone || 'N/A'}`, 350, infoY + 30);
  doc.moveDown(4);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e5e7eb').stroke();
  doc.moveDown(0.5);
  doc.rect(50, doc.y, 495, 20).fillColor('#1e40af').fill();
  const tableY = doc.y + 5;
  doc.fillColor('#ffffff').fontSize(10);
  doc.text('Description', 60, tableY);
  doc.text('Amount (BDT)', 440, tableY);
  doc.moveDown(1.5);
  const items = bill.items || [];
  items.forEach((item, i) => {
    const y = doc.y;
    if (i % 2 === 0) doc.rect(50, y, 495, 20).fillColor('#f9fafb').fill();
    doc.fillColor('#374151').fontSize(9);
    doc.text(item.description || '', 60, y + 5);
    doc.text(`${item.amount || 0}`, 440, y + 5);
    doc.moveDown(1.2);
  });
  doc.moveDown(0.5);
  doc.moveTo(350, doc.y).lineTo(545, doc.y).strokeColor('#e5e7eb').stroke();
  doc.moveDown(0.5);
  doc.fontSize(10).fillColor('#374151');
  doc.text(`Subtotal: BDT ${bill.subtotal}`, 360, doc.y);
  doc.text(`Discount: - BDT ${bill.discount}`, 360, doc.y + 5);
  doc.fontSize(12).fillColor('#1e40af');
  doc.text(`Total: BDT ${bill.totalAmount}`, 360, doc.y + 8);
  doc.fontSize(10).fillColor('#16a34a');
  doc.text(`Paid: BDT ${bill.paidAmount}`, 360, doc.y + 5);
  doc.fillColor('#dc2626');
  doc.text(`Due: BDT ${bill.dueAmount}`, 360, doc.y + 5);
  doc.moveDown(3);
  doc.fontSize(8).fillColor('#9ca3af').text('Thank you for choosing Smart Hospital!', { align: 'center' });
  doc.end();
});

module.exports = { getBills, getBill, createBill, makePayment, downloadBillPDF };