import { useState, useEffect, useCallback } from 'react';
import { dischargeAPI, admissionAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiX } from 'react-icons/fi';

export default function DischargePage() {
  const [discharges, setDischarges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [admissions, setAdmissions] = useState([]);
  const [form, setForm] = useState({ admissionId: '', patientId: '', dischargeType: 'recovered', condition: 'good', dischargeSummary: '', finalDiagnosis: '', followUpDate: '', followUpInstructions: '', prescriptionAtDischarge: '' });
  const [saving, setSaving] = useState(false);

  const fetchDischarges = useCallback(async () => {
    setLoading(true);
    try {
      const res = await dischargeAPI.getAll();
      setDischarges(res.data.data);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDischarges(); }, [fetchDischarges]);

  const openAdd = async () => {
    const res = await admissionAPI.getAll({ status: 'admitted', limit: 100 });
    setAdmissions(res.data.data);
    setShowModal(true);
  };

  const handleAdmissionChange = (admissionId) => {
    const adm = admissions.find(a => a.id == admissionId);
    setForm({ ...form, admissionId, patientId: adm?.patientId || '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await dischargeAPI.create(form);
      toast.success('Patient discharged successfully');
      setShowModal(false); fetchDischarges();
    } catch {} finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Discharge System</h1>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><FiPlus size={16} /> Discharge Patient</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="table-header">Discharge ID</th>
                <th className="table-header">Patient</th>
                <th className="table-header">Type</th>
                <th className="table-header">Condition</th>
                <th className="table-header">Follow-up Date</th>
                <th className="table-header">Discharged At</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-10 text-slate-400">Loading...</td></tr>
              ) : discharges.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-slate-400">No discharge records</td></tr>
              ) : discharges.map(d => (
                <tr key={d.id} className="table-row">
                  <td className="table-cell font-mono text-xs text-blue-600">{d.dischargeId}</td>
                  <td className="table-cell font-medium">{d.patient?.name}</td>
                  <td className="table-cell capitalize">{d.dischargeType?.replace('_', ' ')}</td>
                  <td className="table-cell"><span className={`badge ${d.condition === 'good' || d.condition === 'excellent' ? 'badge-green' : d.condition === 'poor' || d.condition === 'critical' ? 'badge-red' : 'badge-yellow'}`}>{d.condition}</span></td>
                  <td className="table-cell">{d.followUpDate || '—'}</td>
                  <td className="table-cell text-xs">{new Date(d.createdAt).toLocaleDateString()}</td>
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
              <h2 className="text-lg font-semibold text-slate-800">Discharge Patient</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Admitted Patient *</label>
                <select required value={form.admissionId} onChange={e => handleAdmissionChange(e.target.value)} className="input-field">
                  <option value="">Select Admission</option>
                  {admissions.map(a => <option key={a.id} value={a.id}>{a.patient?.name} — {a.ward?.wardName} (Admitted: {new Date(a.admissionDate).toLocaleDateString()})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Discharge Type</label>
                <select value={form.dischargeType} onChange={e => setForm({...form, dischargeType: e.target.value})} className="input-field">
                  {['recovered','referred','against_advice','deceased','transferred'].map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Patient Condition</label>
                <select value={form.condition} onChange={e => setForm({...form, condition: e.target.value})} className="input-field">
                  {['excellent','good','fair','poor','critical'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Follow-up Date</label>
                <input type="date" value={form.followUpDate} onChange={e => setForm({...form, followUpDate: e.target.value})} className="input-field" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Final Diagnosis</label>
                <textarea value={form.finalDiagnosis} onChange={e => setForm({...form, finalDiagnosis: e.target.value})} rows={2} className="input-field" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Discharge Summary</label>
                <textarea value={form.dischargeSummary} onChange={e => setForm({...form, dischargeSummary: e.target.value})} rows={3} className="input-field" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Prescription at Discharge</label>
                <textarea value={form.prescriptionAtDischarge} onChange={e => setForm({...form, prescriptionAtDischarge: e.target.value})} rows={2} className="input-field" placeholder="List medicines and dosage..." />
              </div>
              <div className="col-span-2 flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Processing...' : 'Discharge'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}