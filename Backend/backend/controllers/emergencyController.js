const { Op } = require('sequelize');
const { EmergencyCase, Patient, Doctor, Nurse } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');
const { generateId, paginate } = require('../utils/helpers');

const getEmergencyCases = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const { offset, limit: lim } = paginate(page, limit);
  const where = {};
  if (status) where.status = status;
  const { count, rows } = await EmergencyCase.findAndCountAll({
    where, limit: lim, offset,
    include: [
      { model: Patient, as: 'patient', attributes: ['name', 'patientId', 'age', 'gender', 'bloodGroup', 'phone'] },
      { model: Doctor, as: 'doctor', include: [{ model: require('../models').User, as: 'user', attributes: ['name'] }] },
      { model: Nurse, as: 'nurse', include: [{ model: require('../models').User, as: 'user', attributes: ['name'] }] },
    ],
    order: [['createdAt', 'DESC']],
  });
  res.json({ success: true, data: rows, pagination: { total: count, page: +page, pages: Math.ceil(count / lim) } });
});

const createEmergencyCase = asyncHandler(async (req, res) => {
  const emergencyCase = await EmergencyCase.create({
    ...req.body,
    caseNumber: generateId('EM'),
  });
  await Patient.update({ status: 'emergency' }, { where: { id: req.body.patientId } });
  res.status(201).json({ success: true, message: 'Emergency case created', data: emergencyCase });
});

const updateEmergencyCase = asyncHandler(async (req, res) => {
  const emergencyCase = await EmergencyCase.findByPk(req.params.id);
  if (!emergencyCase) return res.status(404).json({ success: false, message: 'Emergency case not found' });
  const totalCharges = (parseFloat(req.body.medicineCharges) || 0) +
    (parseFloat(req.body.doctorCharges) || 0) +
    (parseFloat(req.body.nurseCharges) || 0);
  await emergencyCase.update({ ...req.body, totalCharges });
  res.json({ success: true, message: 'Emergency case updated', data: emergencyCase });
});

module.exports = { getEmergencyCases, createEmergencyCase, updateEmergencyCase };