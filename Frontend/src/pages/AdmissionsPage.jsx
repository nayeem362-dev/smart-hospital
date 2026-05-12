import { useState, useEffect, useCallback } from 'react';
import { admissionAPI, patientAPI, doctorAPI, wardAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiX } from 'react-icons/fi';

export default function AdmissionsPage() {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [wards, setWards] = useState([]);
  const [form, setForm] = useState({ patientId: '', wardId: '', doctorId: '', bedNumber: '', reason: '', cabinCharges: 0, medicineCharges: 0, doctorCharges: 0, nurseCharges: 0, otherCharges: 0 });
  const [saving, setSaving] = useState(false);

  const fetchAdmissions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await admissionAPI.getAll();
      setAdmissions(res.data.data);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAdmissions(); }, [fetchAdmissions]);

  const openAdd = async () => {
    const [pRes, dRes, wRes] = await Promise.all([patientAPI.getAll({ limit: 100 }), doctorAPI.getAll({ limit: 100 }), wardAPI.getAll()]);
    setPatients(pRes.data.data); setDoctors(dRes.data.data); setWards(wRes.data.data);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await admissionAPI.create(form);
      toast.success('Patient admitted');
      setShowModal(false); fetchAdmissions();
    } catch {} finally { setSaving(false); }
  };

  const statusColor = (s) => ({ admitted: 'badge-blue', under_observation: 'badge-yellow', discharged: 'badge-green', transferred: 'badge-orange' }[s] || 'badge-gray');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Hospital Admissions</h1>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><FiPlus size={16} /> Admit Patient</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="table-header">ID</th>
                <th className="table-header">Patient</th>
                <th className="table-header">Ward</th>
                <th className="table-header">Doctor</th>
                <th className="table-header">Bed</th>
                <th className="table-header">Admitted</th>
                <th className="table-header">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10 text-slate-400">Loading...</td></tr>
              ) : admissions.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-slate-400">No admissions found</td></tr>
              ) : admissions.map(a => (
                <tr key={a.id} className="table-row">
                  <td className="table-cell font-mono text-xs text-blue-600">{a.admissionId}</td>
                  <td className="table-cell">
                    <div className="font-medium">{a.patient?.name}</div>
                    <div className="text-xs text-slate-400">{a.patient?.age}y / {a.patient?.gender}</div>
                  </td>
                  <td className="table-cell">
                    <div>{a.ward?.wardName}</div>
                    <div className="text-xs text-slate-400 capitalize">{a.ward?.type}</div>
                  </td>
                  <td className="table-cell">{a.doctor?.user?.name || '—'}</td>
                  <td className="table-cell">{a.bedNumber || '—'}</td>
                  <td className="table-cell text-xs">{new Date(a.admissionDate).toLocaleDateString()}</td>
                  <td className="table-cell"><span className={`badge ${statusColor(a.status)}`}>{a.status}</span></td>
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
              <h2 className="text-lg font-semibold text-slate-800">Admit Patient</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Patient *</label>
                <select required value={form.patientId} onChange={e => setForm({...form, patientId: e.target.value})} className="input-field">
                  <option value="">Select Patient</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.patientId})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ward *</label>
                <select required value={form.wardId} onChange={e => setForm({...form, wardId: e.target.value})} className="input-field">
                  <option value="">Select Ward</option>
                  {wards.map(w => <option key={w.id} value={w.id}>{w.wardName} ({w.totalBeds - w.occupiedBeds} beds free)</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Doctor</label>
                <select value={form.doctorId} onChange={e => setForm({...form, doctorId: e.target.value})} className="input-field">
                  <option value="">Select Doctor</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.user?.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bed Number</label>
                <input value={form.bedNumber} onChange={e => setForm({...form, bedNumber: e.target.value})} className="input-field" placeholder="e.g. B-12" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason for Admission *</label>
                <textarea required value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} rows={2} className="input-field" />
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Cabin/Ward Charges</label><input type="number" value={form.cabinCharges} onChange={e => setForm({...form, cabinCharges: e.target.value})} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Medicine Charges</label><input type="number" value={form.medicineCharges} onChange={e => setForm({...form, medicineCharges: e.target.value})} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Doctor Charges</label><input type="number" value={form.doctorCharges} onChange={e => setForm({...form, doctorCharges: e.target.value})} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Other Charges</label><input type="number" value={form.otherCharges} onChange={e => setForm({...form, otherCharges: e.target.value})} className="input-field" /></div>
              <div className="col-span-2 flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Admitting...' : 'Admit Patient'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}