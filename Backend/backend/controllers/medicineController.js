const { Op } = require('sequelize');
const { Medicine } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');
const { generateId, paginate } = require('../utils/helpers');

const getMedicines = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, category } = req.query;
  const { offset, limit: lim } = paginate(page, limit);
  const where = { isActive: true };
  if (category) where.category = category;
  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { genericName: { [Op.like]: `%${search}%` } },
      { medicineCode: { [Op.like]: `%${search}%` } },
    ];
  }
  const { count, rows } = await Medicine.findAndCountAll({
    where, limit: lim, offset,
    order: [['name', 'ASC']],
  });
  res.json({ success: true, data: rows, pagination: { total: count, page: +page, pages: Math.ceil(count / lim) } });
});

const createMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.create({
    ...req.body,
    medicineCode: generateId('MED'),
  });
  res.status(201).json({ success: true, message: 'Medicine added', data: medicine });
});

const updateMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findByPk(req.params.id);
  if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' });
  await medicine.update(req.body);
  res.json({ success: true, message: 'Medicine updated', data: medicine });
});

const deleteMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findByPk(req.params.id);
  if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' });
  await medicine.update({ isActive: false });
  res.json({ success: true, message: 'Medicine deactivated' });
});

module.exports = { getMedicines, createMedicine, updateMedicine, deleteMedicine };