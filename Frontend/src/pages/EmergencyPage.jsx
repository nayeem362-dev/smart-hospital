import { useState, useEffect, useCallback } from 'react';
import { emergencyAPI, patientAPI, doctorAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiX, FiAlertCircle } from 'react-icons/fi';

export default function EmergencyPage() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ patientId: '', doctorId: '', severity: 'moderate', chiefComplaint: '', medicineCharges: 0, doctorCharges: 0, nurseCharges: 0 });
  const [saving, setSaving] = useState(false);

  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      const res = await emergencyAPI.getAll();
      setCases(res.data.data);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCases(); }, [fetchCases]);

  const openAdd = async () => {
    const [pRes, dRes] = await Promise.all([patientAPI.getAll({ limit: 100 }), doctorAPI.getAll({ limit: 100 })]);
    setPatients(pRes.data.data);
    setDoctors(dRes.data.data);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await emergencyAPI.create(form);
      toast.success('Emergency case created');
      setShowModal(false); fetchCases();
    } catch {} finally { setSaving(false); }
  };

  const severityColor = (s) => ({ critical: 'badge-red', serious: 'badge-orange', moderate: 'badge-yellow', minor: 'badge-green' }[s] || 'badge-gray');
  const statusColor = (s) => ({ active: 'badge-red', stable: 'badge-yellow', admitted: 'badge-blue', discharged: 'badge-green', deceased: 'badge-gray' }[s] || 'badge-gray');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-800">Emergency Department</h1>
          <span className="badge badge-red">
            <FiAlertCircle size={12} className="mr-1" />
            {cases.filter(c => c.status === 'active').length} Active
          </span>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><FiPlus size={16} /> New Case</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="table-header">Case #</th>
                <th className="table-header">Patient</th>
                <th className="table-header">Doctor</th>
                <th className="table-header">Chief Complaint</th>
                <th className="table-header">Severity</th>
                <th className="table-header">Status</th>
                <th className="table-header">Total Charges</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10 text-slate-400">Loading...</td></tr>
              ) : cases.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-slate-400">No emergency cases</td></tr>
              ) : cases.map(c => (
                <tr key={c.id} className="table-row">
                  <td className="table-cell font-mono text-xs text-red-600">{c.caseNumber}</td>
                  <td className="table-cell">
                    <div className="font-medium">{c.patient?.name}</div>
                    <div className="text-xs text-slate-400">{c.patient?.bloodGroup}</div>
                  </td>
                  <td className="table-cell">{c.doctor?.user?.name || '—'}</td>
                  <td className="table-cell max-w-xs truncate">{c.chiefComplaint}</td>
                  <td className="table-cell"><span className={`badge ${severityColor(c.severity)}`}>{c.severity}</span></td>
                  <td className="table-cell"><span className={`badge ${statusColor(c.status)}`}>{c.status}</span></td>
                  <td className="table-cell font-medium">৳{parseFloat(c.totalCharges || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-red-700 flex items-center gap-2"><FiAlertCircle /> New Emergency Case</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Patient *</label>
                  <select required value={form.patientId} onChange={e => setForm({...form, patientId: e.target.value})} className="input-field">
                    <option value="">Select Patient</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.patientId})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Assign Doctor</label>
                  <select value={form.doctorId} onChange={e => setForm({...form, doctorId: e.target.value})} className="input-field">
                    <option value="">Select Doctor</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.user?.name} — {d.specialization}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Severity *</label>
                  <select required value={form.severity} onChange={e => setForm({...form, severity: e.target.value})} className="input-field">
                    <option value="minor">Minor</option>
                    <option value="moderate">Moderate</option>
                    <option value="serious">Serious</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Doctor Charges (BDT)</label>
                  <input type="number" value={form.doctorCharges} onChange={e => setForm({...form, doctorCharges: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Medicine Charges (BDT)</label>
                  <input type="number" value={form.medicineCharges} onChange={e => setForm({...form, medicineCharges: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nurse Charges (BDT)</label>
                  <input type="number" value={form.nurseCharges} onChange={e => setForm({...form, nurseCharges: e.target.value})} className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Chief Complaint *</label>
                <textarea required value={form.chiefComplaint} onChange={e => setForm({...form, chiefComplaint: e.target.value})} rows={3} className="input-field" placeholder="Describe the emergency..." />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">{saving ? 'Saving...' : 'Create Case'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}