import { useState, useEffect, useCallback } from 'react';
import { patientAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';

const INITIAL_FORM = { name: '', age: '', gender: 'male', bloodGroup: '', phone: '', email: '', address: '', emergencyContact: '', emergencyPhone: '', medicalHistory: '', allergies: '' };

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editPatient, setEditPatient] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await patientAPI.getAll({ page, limit: 10, search, status });
      setPatients(res.data.data);
      setPagination(res.data.pagination);
    } catch {} finally { setLoading(false); }
  }, [page, search, status]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const openAdd = () => { setForm(INITIAL_FORM); setEditPatient(null); setShowModal(true); };
  const openEdit = (p) => { setForm({ name: p.name, age: p.age, gender: p.gender, bloodGroup: p.bloodGroup || '', phone: p.phone, email: p.email || '', address: p.address || '', emergencyContact: p.emergencyContact || '', emergencyPhone: p.emergencyPhone || '', medicalHistory: p.medicalHistory || '', allergies: p.allergies || '' }); setEditPatient(p); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editPatient) {
        await patientAPI.update(editPatient.id, form);
        toast.success('Patient updated');
      } else {
        await patientAPI.create(form);
        toast.success('Patient registered');
      }
      setShowModal(false);
      fetchPatients();
    } catch {} finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this patient?')) return;
    try {
      await patientAPI.delete(id);
      toast.success('Patient deleted');
      fetchPatients();
    } catch {}
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Patients</h1>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <FiPlus size={16} /> Add Patient
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, ID, phone..."
            className="input-field pl-9"
          />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="input-field w-auto">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="admitted">Admitted</option>
          <option value="emergency">Emergency</option>
          <option value="discharged">Discharged</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="table-header">Patient ID</th>
                <th className="table-header">Name</th>
                <th className="table-header">Age/Gender</th>
                <th className="table-header">Blood Group</th>
                <th className="table-header">Phone</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10 text-slate-400">Loading...</td></tr>
              ) : patients.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-slate-400">No patients found</td></tr>
              ) : patients.map(p => (
                <tr key={p.id} className="table-row">
                  <td className="table-cell font-mono text-xs text-blue-600">{p.patientId}</td>
                  <td className="table-cell font-medium">{p.name}</td>
                  <td className="table-cell">{p.age} / <span className="capitalize">{p.gender}</span></td>
                  <td className="table-cell">{p.bloodGroup || '—'}</td>
                  <td className="table-cell">{p.phone}</td>
                  <td className="table-cell">
                    <span className={`badge ${p.status === 'active' ? 'badge-green' : p.status === 'admitted' ? 'badge-blue' : p.status === 'emergency' ? 'badge-red' : 'badge-gray'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><FiEdit2 size={14} /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><FiTrash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <span className="text-sm text-slate-500">Total: {pagination.total}</span>
            <div className="flex gap-1">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 text-sm rounded ${p === page ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800">{editPatient ? 'Edit Patient' : 'Add New Patient'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4">
              {[
                { label: 'Full Name', key: 'name', type: 'text', required: true, col: 2 },
                { label: 'Age', key: 'age', type: 'number', required: true },
                { label: 'Blood Group', key: 'bloodGroup', type: 'text' },
                { label: 'Phone', key: 'phone', type: 'tel', required: true },
                { label: 'Email', key: 'email', type: 'email' },
                { label: 'Emergency Contact', key: 'emergencyContact', type: 'text' },
                { label: 'Emergency Phone', key: 'emergencyPhone', type: 'tel' },
              ].map(({ label, key, type, required, col }) => (
                <div key={key} className={col === 2 ? 'col-span-2' : ''}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{label}{required && ' *'}</label>
                  <input
                    type={type}
                    required={required}
                    value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    className="input-field"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Gender *</label>
                <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} className="input-field" required>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} rows={2} className="input-field" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Medical History</label>
                <textarea value={form.medicalHistory} onChange={e => setForm({ ...form, medicalHistory: e.target.value })} rows={2} className="input-field" />
              </div>
              <div className="col-span-2 flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : editPatient ? 'Update' : 'Register'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}