require('dotenv').config();
const { connectDB } = require('../config/database');
const {
  User, Patient, Doctor, Nurse, Ward, Medicine
} = require('../models');
const { generateId } = require('./helpers');

const seedData = async () => {
  await connectDB();
  console.log('🌱 Seeding database...');

  await Medicine.destroy({ where: {} });
  await Patient.destroy({ where: {} });
  await Doctor.destroy({ where: {} });
  await Nurse.destroy({ where: {} });
  await Ward.destroy({ where: {} });
  await User.destroy({ where: {} });

  const users = await User.bulkCreate([
    { name: 'Admin User', email: 'admin@hospital.com', password: 'Admin@123456', role: 'admin', phone: '01700000001', isActive: true },
    { name: 'Dr. Ahmed Hassan', email: 'dr.ahmed@hospital.com', password: 'Doctor@123', role: 'doctor', phone: '01700000002', isActive: true },
    { name: 'Dr. Sarah Khan', email: 'dr.sarah@hospital.com', password: 'Doctor@123', role: 'doctor', phone: '01700000003', isActive: true },
    { name: 'Nurse Fatima', email: 'nurse.fatima@hospital.com', password: 'Nurse@123', role: 'nurse', phone: '01700000005', isActive: true },
    { name: 'Receptionist Mina', email: 'reception@hospital.com', password: 'Reception@123', role: 'receptionist', phone: '01700000007', isActive: true },
    { name: 'Lab Staff Karim', email: 'lab@hospital.com', password: 'Lab@123456', role: 'diagnostic_staff', phone: '01700000008', isActive: true },
    { name: 'John Patient', email: 'john@gmail.com', password: 'Patient@123', role: 'patient', phone: '01800000001', isActive: true },
  ], { individualHooks: true });

  const wards = await Ward.bulkCreate([
    { wardNumber: 'W-001', wardName: 'General Ward A', type: 'ward', totalBeds: 20, occupiedBeds: 12, chargePerDay: 1500, floor: 'Ground' },
    { wardNumber: 'W-002', wardName: 'General Ward B', type: 'ward', totalBeds: 20, occupiedBeds: 8, chargePerDay: 1500, floor: '1st' },
    { wardNumber: 'C-001', wardName: 'VIP Cabin', type: 'cabin', totalBeds: 5, occupiedBeds: 3, chargePerDay: 5000, floor: '3rd' },
    { wardNumber: 'ICU-001', wardName: 'ICU', type: 'icu', totalBeds: 10, occupiedBeds: 7, chargePerDay: 10000, floor: '2nd' },
    { wardNumber: 'EM-001', wardName: 'Emergency Ward', type: 'emergency', totalBeds: 15, occupiedBeds: 5, chargePerDay: 2500, floor: 'Ground' },
  ]);

  await Doctor.bulkCreate([
    { userId: users[1].id, doctorId: generateId('DR'), specialization: 'Emergency Medicine', department: 'emergency', qualification: 'MBBS, MD', experience: 10, consultationFee: 800, availableDays: ['Mon','Tue','Wed','Thu','Fri'], availableHours: { start: '09:00', end: '17:00' }, isAvailable: true },
    { userId: users[2].id, doctorId: generateId('DR'), specialization: 'Cardiology', department: 'cardiology', qualification: 'MBBS, MD (Cardiology)', experience: 15, consultationFee: 1200, availableDays: ['Mon','Wed','Fri'], availableHours: { start: '10:00', end: '16:00' }, isAvailable: true },
  ]);

  await Nurse.bulkCreate([
    { userId: users[3].id, nurseId: generateId('NR'), department: 'Emergency', shift: 'morning', wardId: wards[4].id, qualification: 'BSc Nursing', isAvailable: true },
  ]);

  await Patient.bulkCreate([
    { patientId: generateId('PT'), userId: users[6].id, name: 'John Patient', age: 35, gender: 'male', bloodGroup: 'O+', phone: '01800000001', email: 'john@gmail.com', address: 'Dhaka, Bangladesh', status: 'active' },
    { patientId: generateId('PT'), name: 'Rahim Uddin', age: 45, gender: 'male', bloodGroup: 'B+', phone: '01711111111', address: 'Sylhet, Bangladesh', status: 'active' },
    { patientId: generateId('PT'), name: 'Sumaiya Begum', age: 32, gender: 'female', bloodGroup: 'AB-', phone: '01722222222', address: 'Rajshahi, Bangladesh', status: 'admitted' },
    { patientId: generateId('PT'), name: 'Kamal Hossain', age: 60, gender: 'male', bloodGroup: 'O-', phone: '01733333333', address: 'Dhaka, Bangladesh', status: 'emergency' },
  ]);

  await Medicine.bulkCreate([
    { medicineCode: generateId('MED'), name: 'Paracetamol 500mg', genericName: 'Acetaminophen', category: 'Analgesic', type: 'tablet', unitPrice: 2.5, stockQuantity: 500, reorderLevel: 50, manufacturer: 'Square Pharma' },
    { medicineCode: generateId('MED'), name: 'Amoxicillin 250mg', genericName: 'Amoxicillin', category: 'Antibiotic', type: 'capsule', unitPrice: 8.0, stockQuantity: 200, reorderLevel: 30, manufacturer: 'Beximco' },
    { medicineCode: generateId('MED'), name: 'Omeprazole 20mg', genericName: 'Omeprazole', category: 'Antacid', type: 'capsule', unitPrice: 6.0, stockQuantity: 250, reorderLevel: 30, manufacturer: 'Incepta' },
    { medicineCode: generateId('MED'), name: 'Metformin 500mg', genericName: 'Metformin HCl', category: 'Antidiabetic', type: 'tablet', unitPrice: 5.0, stockQuantity: 300, reorderLevel: 40, manufacturer: 'ACI' },
    { medicineCode: generateId('MED'), name: 'Ceftriaxone 1g', genericName: 'Ceftriaxone', category: 'Antibiotic', type: 'injection', unitPrice: 120.0, stockQuantity: 100, reorderLevel: 20, manufacturer: 'Opsonin' },
  ]);

  console.log('\n🎉 Seeding complete!');
  console.log('📋 Login credentials:');
  console.log('  Admin:        admin@hospital.com / Admin@123456');
  console.log('  Doctor:       dr.ahmed@hospital.com / Doctor@123');
  console.log('  Nurse:        nurse.fatima@hospital.com / Nurse@123');
  console.log('  Receptionist: reception@hospital.com / Reception@123');
  console.log('  Patient:      john@gmail.com / Patient@123');
  process.exit(0);
};

seedData().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});