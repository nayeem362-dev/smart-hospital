import { useState, useEffect, useCallback } from 'react';
import { diagnosticAPI, patientAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiX, FiEdit2 } from 'react-icons/fi';

const TEST_TYPES = ['xray','blood_test','urine_test','mri','ct_scan','ultrasound','ecg','other'];

export default function DiagnosticPage() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [patients, setPatients] = useState([]);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [form, setForm] = useState({ patientId: '', testType: 'blood_test', testName: '', testDetails: '', charges: 0, scheduledAt: '' });
  const [saving, setSaving] = useState(false);

  const fetchTests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await diagnosticAPI.getAll({ testType: filterType, status: filterStatus });
      setTests(res.data.data);
    } catch {} finally { setLoading(false); }
  }, [filterType, filterStatus]);

  useEffect(() => { fetchTests(); }, [fetchTests]);

  const openAdd = async () => {
    const res = await patientAPI.getAll({ limit: 100 });
    setPatients(res.data.data);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await diagnosticAPI.create(form);
      toast.success('Test created');
      setShowModal(false); fetchTests();
    } catch {} finally { setSaving(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      await diagnosticAPI.update(id, { status });
      toast.success('Status updated');
      fetchTests();
    } catch {}
  };

  const statusColor = (s) => ({ pending: 'badge-yellow', in_progress: 'badge-blue', completed: 'badge-green', cancelled: 'badge-red' }[s] || 'badge-gray');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Diagnostic Center</h1>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><FiPlus size={16} /> Order Test</button>
      </div>

      <div className="flex gap-3">
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="input-field w-auto">
          <option value="">All Test Types</option>
          {TEST_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ').toUpperCase()}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-field w-auto">
          <option value="">All Status</option>
          {['pending','in_progress','completed','cancelled'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="table-header">Test ID</th>
                <th className="table-header">Patient</th>
                <th className="table-header">Test Name</th>
                <th className="table-header">Type</th>
                <th className="table-header">Charges</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10 text-slate-400">Loading...</td></tr>
              ) : tests.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-slate-400">No tests found</td></tr>
              ) : tests.map(t => (
                <tr key={t.id} className="table-row">
                  <td className="table-cell font-mono text-xs text-blue-600">{t.testId}</td>
                  <td className="table-cell">
                    <div className="font-medium">{t.patient?.name}</div>
                    <div className="text-xs text-slate-400">{t.patient?.patientId}</div>
                  </td>
                  <td className="table-cell font-medium">{t.testName}</td>
                  <td className="table-cell uppercase text-xs">{t.testType?.replace('_', ' ')}</td>
                  <td className="table-cell">৳{parseFloat(t.charges).toLocaleString()}</td>
                  <td className="table-cell"><span className={`badge ${statusColor(t.status)}`}>{t.status}</span></td>
                  <td className="table-cell">
                    {t.status === 'pending' && (
                      <button onClick={() => updateStatus(t.id, 'in_progress')} className="text-xs btn-secondary py-1 px-2">Start</button>
                    )}
                    {t.status === 'in_progress' && (
                      <button onClick={() => updateStatus(t.id, 'completed')} className="text-xs btn-success py-1 px-2">Complete</button>
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
              <h2 className="text-lg font-semibold text-slate-800">Order Diagnostic Test</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Patient *</label>
                <select required value={form.patientId} onChange={e => setForm({...form, patientId: e.target.value})} className="input-field">
                  <option value="">Select Patient</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.patientId})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Test Type *</label>
                  <select required value={form.testType} onChange={e => setForm({...form, testType: e.target.value})} className="input-field">
                    {TEST_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ').toUpperCase()}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Test Name *</label>
                  <input required value={form.testName} onChange={e => setForm({...form, testName: e.target.value})} className="input-field" placeholder="e.g. CBC, Chest X-Ray" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Charges (BDT)</label>
                  <input type="number" value={form.charges} onChange={e => setForm({...form, charges: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Scheduled Date</label>
                  <input type="datetime-local" value={form.scheduledAt} onChange={e => setForm({...form, scheduledAt: e.target.value})} className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Test Details</label>
                <textarea value={form.testDetails} onChange={e => setForm({...form, testDetails: e.target.value})} rows={2} className="input-field" />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Order Test'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}