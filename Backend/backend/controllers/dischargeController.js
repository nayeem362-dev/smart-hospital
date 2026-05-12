const { Discharge, Admission, Patient, Bill } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');
const { generateId } = require('../utils/helpers');

const getDischarges = asyncHandler(async (req, res) => {
  const discharges = await Discharge.findAll({
    include: [
      { model: Patient, as: 'patient', attributes: ['name', 'patientId', 'phone', 'age', 'gender'] },
      { model: Admission, as: 'admission' },
    ],
    order: [['createdAt', 'DESC']],
  });
  res.json({ success: true, data: discharges });
});

const createDischarge = asyncHandler(async (req, res) => {
  const admission = await Admission.findByPk(req.body.admissionId);
  if (!admission) return res.status(404).json({ success: false, message: 'Admission not found' });

  const admitDate = new Date(admission.admissionDate);
  const today = new Date();
  const totalDays = Math.ceil((today - admitDate) / (1000 * 60 * 60 * 24)) || 1;

  const discharge = await Discharge.create({
    ...req.body,
    dischargeId: generateId('DIS'),
    dischargedBy: req.user.id,
  });

  await admission.update({ status: 'discharged', dischargeDate: new Date(), totalDays });
  await Patient.update({ status: 'discharged' }, { where: { id: admission.patientId } });

  const { Ward } = require('../models');
  const ward = await Ward.findByPk(admission.wardId);
  if (ward && ward.occupiedBeds > 0) {
    await ward.update({ occupiedBeds: ward.occupiedBeds - 1 });
  }

  res.status(201).json({ success: true, message: 'Patient discharged', data: discharge });
});

module.exports = { getDischarges, createDischarge };