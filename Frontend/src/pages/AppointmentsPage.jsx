import { useState, useEffect, useCallback } from 'react';
import { appointmentAPI, patientAPI, doctorAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiX } from 'react-icons/fi';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ patientId: '', doctorId: '', appointmentDate: '', appointmentTime: '', type: 'consultation', reason: '', symptoms: '' });
  const [saving, setSaving] = useState(false);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await appointmentAPI.getAll();
      setAppointments(res.data.data);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const openAdd = async () => {
    const [pRes, dRes] = await Promise.all([patientAPI.getAll({ limit: 100 }), doctorAPI.getAll({ limit: 100 })]);
    setPatients(pRes.data.data); setDoctors(dRes.data.data);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await appointmentAPI.create(form);
      toast.success('Appointment booked');
      setShowModal(false); fetchAppointments();
    } catch {} finally { setSaving(false); }
  };

  const updateStatus = async (id, status) => {
    try { await appointmentAPI.update(id, { status }); toast.success('Status updated'); fetchAppointments(); } catch {}
  };

  const statusColor = (s) => ({ scheduled: 'badge-blue', confirmed: 'badge-green', in_progress: 'badge-orange', completed: 'badge-gray', cancelled: 'badge-red' }[s] || 'badge-gray');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Appointments</h1>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><FiPlus size={16} /> Book Appointment</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="table-header">ID</th>
                <th className="table-header">Patient</th>
                <th className="table-header">Doctor</th>
                <th className="table-header">Date & Time</th>
                <th className="table-header">Type</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10 text-slate-400">Loading...</td></tr>
              ) : appointments.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-slate-400">No appointments found</td></tr>
              ) : appointments.map(a => (
                <tr key={a.id} className="table-row">
                  <td className="table-cell font-mono text-xs text-blue-600">{a.appointmentId}</td>
                  <td className="table-cell font-medium">{a.patient?.name}</td>
                  <td className="table-cell">{a.doctor?.user?.name}</td>
                  <td className="table-cell">{a.appointmentDate} {a.appointmentTime?.slice(0,5)}</td>
                  <td className="table-cell capitalize">{a.type?.replace('_', ' ')}</td>
                  <td className="table-cell"><span className={`badge ${statusColor(a.status)}`}>{a.status}</span></td>
                  <td className="table-cell">
                    {a.status === 'scheduled' && (
                      <div className="flex gap-1">
                        <button onClick={() => updateStatus(a.id, 'confirmed')} className="text-xs btn-success py-1 px-2">Confirm</button>
                        <button onClick={() => updateStatus(a.id, 'cancelled')} className="text-xs btn-danger py-1 px-2">Cancel</button>
                      </div>
                    )}
                    {a.status === 'confirmed' && (
                      <button onClick={() => updateStatus(a.id, 'completed')} className="text-xs btn-secondary py-1 px-2">Complete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800">Book Appointment</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Patient *</label>
                  <select required value={form.patientId} onChange={e => setForm({...form, patientId: e.target.value})} className="input-field">
                    <option value="">Select Patient</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Doctor *</label>
                  <select required value={form.doctorId} onChange={e => setForm({...form, doctorId: e.target.value})} className="input-field">
                    <option value="">Select Doctor</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.user?.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
                  <input type="date" required value={form.appointmentDate} onChange={e => setForm({...form, appointmentDate: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Time *</label>
                  <input type="time" required value={form.appointmentTime} onChange={e => setForm({...form, appointmentTime: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="input-field">
                    {['consultation','follow_up','emergency','specialized'].map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                <textarea value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} rows={2} className="input-field" />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Booking...' : 'Book'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}