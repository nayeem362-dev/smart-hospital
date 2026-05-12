const { Op } = require('sequelize');
const { Patient, Admission, Bill, Diagnostic, Appointment } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');
const { generateId, paginate } = require('../utils/helpers');

const getPatients = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, status } = req.query;
  const { offset, limit: lim } = paginate(page, limit);
  const where = {};
  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { patientId: { [Op.like]: `%${search}%` } },
      { phone: { [Op.like]: `%${search}%` } },
    ];
  }
  if (status) where.status = status;
  const { count, rows } = await Patient.findAndCountAll({
    where, limit: lim, offset,
    order: [['createdAt', 'DESC']],
  });
  res.json({
    success: true,
    data: rows,
    pagination: { total: count, page: +page, pages: Math.ceil(count / lim), limit: lim },
  });
});

const getPatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findByPk(req.params.id, {
    include: [
      { model: Admission, as: 'admissions', limit: 5, order: [['createdAt', 'DESC']] },
      { model: Bill, as: 'bills', limit: 5, order: [['createdAt', 'DESC']] },
      { model: Diagnostic, as: 'diagnostics', limit: 5, order: [['createdAt', 'DESC']] },
      { model: Appointment, as: 'appointments', limit: 5, order: [['createdAt', 'DESC']] },
    ],
  });
  if (!patient) {
    return res.status(404).json({ success: false, message: 'Patient not found' });
  }
  res.json({ success: true, data: patient });
});

const createPatient = asyncHandler(async (req, res) => {
  const patient = await Patient.create({
    ...req.body,
    patientId: generateId('PT'),
    registeredBy: req.user.id,
  });
  res.status(201).json({ success: true, message: 'Patient registered', data: patient });
});

const updatePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findByPk(req.params.id);
  if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
  await patient.update(req.body);
  res.json({ success: true, message: 'Patient updated', data: patient });
});

const deletePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findByPk(req.params.id);
  if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
  await patient.destroy();
  res.json({ success: true, message: 'Patient deleted' });
});

const getPatientStats = asyncHandler(async (req, res) => {
  const total = await Patient.count();
  const active = await Patient.count({ where: { status: 'active' } });
  const admitted = await Patient.count({ where: { status: 'admitted' } });
  const emergency = await Patient.count({ where: { status: 'emergency' } });
  const discharged = await Patient.count({ where: { status: 'discharged' } });
  res.json({ success: true, data: { total, active, admitted, emergency, discharged } });
});

module.exports = { getPatients, getPatient, createPatient, updatePatient, deletePatient, getPatientStats };