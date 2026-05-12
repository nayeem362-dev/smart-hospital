const { Ward } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');
const { generateId } = require('../utils/helpers');

const getWards = asyncHandler(async (req, res) => {
  const { type } = req.query;
  const where = {};
  if (type) where.type = type;
  const wards = await Ward.findAll({ where, order: [['wardNumber', 'ASC']] });
  res.json({ success: true, data: wards });
});

const createWard = asyncHandler(async (req, res) => {
  const ward = await Ward.create(req.body);
  res.status(201).json({ success: true, message: 'Ward created', data: ward });
});

const updateWard = asyncHandler(async (req, res) => {
  const ward = await Ward.findByPk(req.params.id);
  if (!ward) return res.status(404).json({ success: false, message: 'Ward not found' });
  await ward.update(req.body);
  res.json({ success: true, message: 'Ward updated', data: ward });
});

const getWardStats = asyncHandler(async (req, res) => {
  const wards = await Ward.findAll();
  const totalBeds = wards.reduce((s, w) => s + w.totalBeds, 0);
  const occupiedBeds = wards.reduce((s, w) => s + w.occupiedBeds, 0);
  res.json({ success: true, data: { totalBeds, occupiedBeds, availableBeds: totalBeds - occupiedBeds, wards } });
});

module.exports = { getWards, createWard, updateWard, getWardStats };