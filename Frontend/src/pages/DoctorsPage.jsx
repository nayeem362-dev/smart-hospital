import { useState, useEffect, useCallback } from 'react';
import { doctorAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';

const DEPTS = ['emergency','cardiology','neurology','orthopedics','pediatrics','gynecology','surgery','opd','diagnostic','general'];
const INITIAL = { name: '', email: '', password: '', phone: '', specialization: '', department: 'general', qualification: '', experience: 0, consultationFee: 0, bio: '' };

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editDoc, setEditDoc] = useState(null);
  const [form, setForm] = useState(INITIAL);
  const [saving, setSaving] = useState(false);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await doctorAPI.getAll({ search, department: dept });
      setDoctors(res.data.data);
    } catch {} finally { setLoading(false); }
  }, [search, dept]);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  const openAdd = () => { setForm(INITIAL); setEditDoc(null); setShowModal(true); };
  const openEdit = (d) => {
    setForm({ name: d.user?.name || '', email: d.user?.email || '', password: '', phone: d.user?.phone || '', specialization: d.specialization, department: d.department, qualification: d.qualification || '', experience: d.experience, consultationFee: d.consultationFee, bio: d.bio || '' });
    setEditDoc(d); setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editDoc) {
        await doctorAPI.update(editDoc.id, form);
        toast.success('Doctor updated');
      } else {
        await doctorAPI.create(form);
        toast.success('Doctor added');
      }
      setShowModal(false); fetchDoctors();
    } catch {} finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this doctor?')) return;
    try { await doctorAPI.delete(id); toast.success('Doctor removed'); fetchDoctors(); } catch {}
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Doctors</h1>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><FiPlus size={16} /> Add Doctor</button>
      </div>
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search doctors..." className="input-field pl-9" />
        </div>
        <select value={dept} onChange={e => setDept(e.target.value)} className="input-field w-auto">
          <option value="">All Departments</option>
          {DEPTS.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
        </select>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="table-header">ID</th>
                <th className="table-header">Name</th>
                <th className="table-header">Specialization</th>
                <th className="table-header">Department</th>
                <th className="table-header">Experience</th>
                <th className="table-header">Fee</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-10 text-slate-400">Loading...</td></tr>
              ) : doctors.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-slate-400">No doctors found</td></tr>
              ) : doctors.map(d => (
                <tr key={d.id} className="table-row">
                  <td className="table-cell font-mono text-xs text-blue-600">{d.doctorId}</td>
                  <td className="table-cell font-medium">{d.user?.name}</td>
                  <td className="table-cell">{d.specialization}</td>
                  <td className="table-cell capitalize">{d.department}</td>
                  <td className="table-cell">{d.experience} yrs</td>
                  <td className="table-cell">৳{d.consultationFee}</td>
                  <td className="table-cell">
                    <span className={`badge ${d.isAvailable ? 'badge-green' : 'badge-red'}`}>
                      {d.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(d)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><FiEdit2 size={14} /></button>
                      <button onClick={() => handleDelete(d.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><FiTrash2 size={14} /></button>
                    </div>
                  </td>
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
              <h2 className="text-lg font-semibold text-slate-800">{editDoc ? 'Edit Doctor' : 'Add Doctor'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label><input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Email *</label><input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-field" disabled={!!editDoc} /></div>
              {!editDoc && <div><label className="block text-sm font-medium text-slate-700 mb-1">Password *</label><input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="input-field" /></div>}
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Phone</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Specialization *</label><input required value={form.specialization} onChange={e => setForm({...form, specialization: e.target.value})} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Department *</label>
                <select required value={form.department} onChange={e => setForm({...form, department: e.target.value})} className="input-field">
                  {DEPTS.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase()+d.slice(1)}</option>)}
                </select>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Qualification</label><input value={form.qualification} onChange={e => setForm({...form, qualification: e.target.value})} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Experience (years)</label><input type="number" value={form.experience} onChange={e => setForm({...form, experience: e.target.value})} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Consultation Fee (BDT)</label><input type="number" value={form.consultationFee} onChange={e => setForm({...form, consultationFee: e.target.value})} className="input-field" /></div>
              <div className="col-span-2 flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : editDoc ? 'Update' : 'Add Doctor'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}