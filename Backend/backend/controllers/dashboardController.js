const { Op, fn, col } = require('sequelize');
const { sequelize } = require('../config/database');
const { Patient, Doctor, Nurse, EmergencyCase, Admission, Payment, Appointment, Ward } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');

const getAdminDashboard = asyncHandler(async (req, res) => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [totalPatients, totalDoctors, totalNurses, totalBeds, occupiedBeds,
    emergencyActive, todayAppointments, monthlyRevenue, recentPatients] = await Promise.all([
    Patient.count(),
    Doctor.count(),
    Nurse.count(),
    Ward.sum('totalBeds'),
    Ward.sum('occupiedBeds'),
    EmergencyCase.count({ where: { status: ['active', 'stable'] } }),
    Appointment.count({ where: { appointmentDate: today.toISOString().split('T')[0] } }),
    Payment.sum('amount', { where: { createdAt: { [Op.gte]: startOfMonth }, status: 'completed' } }),
    Patient.findAll({ limit: 5, order: [['createdAt', 'DESC']] }),
  ]);

  const revenueChart = await sequelize.query(
    `SELECT DATE_FORMAT(createdAt, '%Y-%m') as month, SUM(amount) as revenue, COUNT(*) as transactions
     FROM payments WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 6 MONTH) AND status = 'completed'
     GROUP BY DATE_FORMAT(createdAt, '%Y-%m') ORDER BY month ASC`,
    { type: sequelize.QueryTypes.SELECT }
  );

  const patientsByStatus = await Patient.findAll({
    attributes: ['status', [fn('COUNT', col('id')), 'count']],
    group: ['status'],
    raw: true,
  });

  res.json({
    success: true,
    data: {
      stats: {
        totalPatients, totalDoctors, totalNurses,
        availableBeds: (totalBeds || 0) - (occupiedBeds || 0),
        occupiedBeds: occupiedBeds || 0,
        totalBeds: totalBeds || 0,
        emergencyActive, todayAppointments,
        monthlyRevenue: monthlyRevenue || 0,
        bedOccupancyRate: totalBeds ? Math.round(((occupiedBeds || 0) / totalBeds) * 100) : 0,
      },
      recentPatients,
      revenueChart,
      patientsByStatus,
    },
  });
});

module.exports = { getAdminDashboard };