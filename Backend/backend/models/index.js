const User = require('./User');
const Patient = require('./Patient');
const Doctor = require('./Doctor');
const Nurse = require('./Nurse');
const Ward = require('./Ward');
const EmergencyCase = require('./EmergencyCase');
const Diagnostic = require('./Diagnostic');
const Appointment = require('./Appointment');
const Admission = require('./Admission');
const Bill = require('./Bill');
const Payment = require('./Payment');
const Discharge = require('./Discharge');
const Medicine = require('./Medicine');
const OPD = require('./OPD');

// User associations
User.hasOne(Doctor, { foreignKey: 'userId', as: 'doctorProfile' });
User.hasOne(Nurse, { foreignKey: 'userId', as: 'nurseProfile' });
User.hasOne(Patient, { foreignKey: 'userId', as: 'patientProfile' });
Doctor.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Nurse.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Patient.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Patient associations
Patient.hasMany(EmergencyCase, { foreignKey: 'patientId', as: 'emergencies' });
Patient.hasMany(Diagnostic, { foreignKey: 'patientId', as: 'diagnostics' });
Patient.hasMany(Appointment, { foreignKey: 'patientId', as: 'appointments' });
Patient.hasMany(Admission, { foreignKey: 'patientId', as: 'admissions' });
Patient.hasMany(Bill, { foreignKey: 'patientId', as: 'bills' });
Patient.hasMany(OPD, { foreignKey: 'patientId', as: 'opdRecords' });
EmergencyCase.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
Diagnostic.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
Appointment.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
Admission.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
Bill.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
OPD.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });

// Doctor associations
Doctor.hasMany(EmergencyCase, { foreignKey: 'doctorId', as: 'emergencyCases' });
Doctor.hasMany(Appointment, { foreignKey: 'doctorId', as: 'appointments' });
Doctor.hasMany(Admission, { foreignKey: 'doctorId', as: 'admissions' });
Doctor.hasMany(OPD, { foreignKey: 'doctorId', as: 'opdRecords' });
EmergencyCase.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });
Admission.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });
OPD.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });

// Nurse & Ward associations
Nurse.belongsTo(Ward, { foreignKey: 'wardId', as: 'ward' });
Ward.hasMany(Nurse, { foreignKey: 'wardId', as: 'nurses' });
Nurse.hasMany(Admission, { foreignKey: 'nurseId', as: 'admissions' });
Admission.belongsTo(Nurse, { foreignKey: 'nurseId', as: 'nurse' });
EmergencyCase.belongsTo(Nurse, { foreignKey: 'nurseId', as: 'nurse' });
Ward.hasMany(Admission, { foreignKey: 'wardId', as: 'admissions' });
Admission.belongsTo(Ward, { foreignKey: 'wardId', as: 'ward' });

// Bill & Payment associations
Bill.hasMany(Payment, { foreignKey: 'billId', as: 'payments' });
Payment.belongsTo(Bill, { foreignKey: 'billId', as: 'bill' });
Bill.belongsTo(Admission, { foreignKey: 'admissionId', as: 'admission' });

// Discharge associations
Discharge.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
Discharge.belongsTo(Admission, { foreignKey: 'admissionId', as: 'admission' });
Discharge.belongsTo(Bill, { foreignKey: 'billId', as: 'bill' });
Admission.hasOne(Discharge, { foreignKey: 'admissionId', as: 'discharge' });

module.exports = {
  User, Patient, Doctor, Nurse, Ward,
  EmergencyCase, Diagnostic, Appointment,
  Admission, Bill, Payment, Discharge, Medicine, OPD,
};