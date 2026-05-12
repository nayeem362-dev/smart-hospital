const { Op } = require('sequelize');
const { Appointment, Patient, Doctor } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');
const { generateId, paginate } = require('../utils/helpers');

const getAppointments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, doctorId, date } = req.query;
  const { offset, limit: lim } = paginate(page, limit);
  const where = {};
  if (status) where.status = status;
  if (doctorId) where.doctorId = doctorId;
  if (date) where.appointmentDate = date;
  const { count, rows } = await Appointment.findAndCountAll({
    where, limit: lim, offset,
    include: [
      { model: Patient, as: 'patient', attributes: ['name', 'patientId', 'phone', 'age', 'gender'] },
      { model: Doctor, as: 'doctor', include: [{ model: require('../models').User, as: 'user', attributes: ['name'] }] },
    ],
    order: [['appointmentDate', 'DESC'], ['appointmentTime', 'DESC']],
  });
  res.json({ success: true, data: rows, pagination: { total: count, page: +page, pages: Math.ceil(count / lim) } });
});

const createAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.create({
    ...req.body,
    appointmentId: generateId('APT'),
    bookedBy: req.user.id,
  });
  res.status(201).json({ success: true, message: 'Appointment booked', data: appointment });
});

const updateAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findByPk(req.params.id);
  if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
  await appointment.update(req.body);
  res.json({ success: true, message: 'Appointment updated', data: appointment });
});

module.exports = { getAppointments, createAppointment, updateAppointment };