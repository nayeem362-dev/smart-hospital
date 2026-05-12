const { User, Doctor, Nurse, Patient } = require('../models');
const { generateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { generateId } = require('../utils/helpers');

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone } = req.body;
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return res.status(409).json({ success: false, message: 'Email already registered' });
  }
  const user = await User.create({ name, email, password, role: role || 'patient', phone });
  if (user.role === 'patient') {
    await Patient.create({
      patientId: generateId('PT'),
      userId: user.id,
      name: user.name,
      age: req.body.age || 0,
      gender: req.body.gender || 'male',
      phone: user.phone || '',
      email: user.email,
    });
  }
  const token = generateToken(user.id);
  res.status(201).json({ success: true, message: 'Registration successful', token, user: user.toJSON() });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }
  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  if (!user.isActive) {
    return res.status(401).json({ success: false, message: 'Account is deactivated' });
  }
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  await user.update({ lastLogin: new Date() });
  const token = generateToken(user.id);
  res.json({ success: true, message: 'Login successful', token, user: user.toJSON() });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    include: [
      { model: Doctor, as: 'doctorProfile' },
      { model: Nurse, as: 'nurseProfile' },
      { model: Patient, as: 'patientProfile' },
    ],
  });
  res.json({ success: true, user });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  await req.user.update({ name, phone });
  res.json({ success: true, message: 'Profile updated', user: req.user.toJSON() });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findByPk(req.user.id);
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }
  await user.update({ password: newPassword });
  res.json({ success: true, message: 'Password changed successfully' });
});

module.exports = { register, login, getMe, updateProfile, changePassword };