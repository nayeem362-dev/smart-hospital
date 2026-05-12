const { Op } = require('sequelize');
const { Doctor, User, Appointment } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');
const { generateId, paginate } = require('../utils/helpers');

const getDoctors = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, department } = req.query;
  const { offset, limit: lim } = paginate(page, limit);
  const where = {};
  if (department) where.department = department;
  if (search) {
    where[Op.or] = [
      { specialization: { [Op.like]: `%${search}%` } },
      { doctorId: { [Op.like]: `%${search}%` } },
    ];
  }
  const { count, rows } = await Doctor.findAndCountAll({
    where, limit: lim, offset,
    include: [{ model: User, as: 'user', attributes: ['name', 'email', 'phone', 'avatar'] }],
    order: [['createdAt', 'DESC']],
  });
  res.json({ success: true, data: rows, pagination: { total: count, page: +page, pages: Math.ceil(count / lim) } });
});

const getDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findByPk(req.params.id, {
    include: [{ model: User, as: 'user', attributes: ['name', 'email', 'phone', 'avatar'] }],
  });
  if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
  res.json({ success: true, data: doctor });
});

const createDoctor = asyncHandler(async (req, res) => {
  const { name, email, password, phone, specialization, department, qualification, experience, consultationFee, availableDays, availableHours, bio } = req.body;
  const user = await User.create({ name, email, password, role: 'doctor', phone });
  const doctor = await Doctor.create({
    userId: user.id,
    doctorId: generateId('DR'),
    specialization, department, qualification,
    experience: experience || 0,
    consultationFee: consultationFee || 0,
    availableDays: availableDays || [],
    availableHours: availableHours || {},
    bio,
  });
  res.status(201).json({ success: true, message: 'Doctor created', data: doctor });
});

const updateDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findByPk(req.params.id);
  if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
  await doctor.update(req.body);
  if (req.body.name || req.body.phone) {
    await User.update({ name: req.body.name, phone: req.body.phone }, { where: { id: doctor.userId } });
  }
  res.json({ success: true, message: 'Doctor updated', data: doctor });
});

const deleteDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findByPk(req.params.id);
  if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
  await User.update({ isActive: false }, { where: { id: doctor.userId } });
  await doctor.destroy();
  res.json({ success: true, message: 'Doctor deleted' });
});

module.exports = { getDoctors, getDoctor, createDoctor, updateDoctor, deleteDoctor };