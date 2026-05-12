const { Op } = require('sequelize');
const { Diagnostic, Patient } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');
const { generateId, paginate } = require('../utils/helpers');

const getDiagnostics = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, testType, patientId } = req.query;
  const { offset, limit: lim } = paginate(page, limit);
  const where = {};
  if (status) where.status = status;
  if (testType) where.testType = testType;
  if (patientId) where.patientId = patientId;
  const { count, rows } = await Diagnostic.findAndCountAll({
    where, limit: lim, offset,
    include: [{ model: Patient, as: 'patient', attributes: ['name', 'patientId', 'phone'] }],
    order: [['createdAt', 'DESC']],
  });
  res.json({ success: true, data: rows, pagination: { total: count, page: +page, pages: Math.ceil(count / lim) } });
});

const createDiagnostic = asyncHandler(async (req, res) => {
  const diagnostic = await Diagnostic.create({
    ...req.body,
    testId: generateId('TEST'),
    conductedBy: req.user.id,
  });
  res.status(201).json({ success: true, message: 'Test created', data: diagnostic });
});

const updateDiagnostic = asyncHandler(async (req, res) => {
  const diagnostic = await Diagnostic.findByPk(req.params.id);
  if (!diagnostic) return res.status(404).json({ success: false, message: 'Test not found' });
  if (req.body.status === 'completed') {
    req.body.completedAt = new Date();
  }
  await diagnostic.update(req.body);
  res.json({ success: true, message: 'Test updated', data: diagnostic });
});

module.exports = { getDiagnostics, createDiagnostic, updateDiagnostic };