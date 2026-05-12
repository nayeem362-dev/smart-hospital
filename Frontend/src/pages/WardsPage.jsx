import { useState, useEffect, useCallback } from 'react';
import { wardAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiX, FiEdit2 } from 'react-icons/fi';

export default function WardsPage() {
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editWard, setEditWard] = useState(null);
  const [form, setForm] = useState({ wardNumber: '', wardName: '', type: 'general', totalBeds: 1, chargePerDay: 0, floor: '', description: '' });
  const [saving, setSaving] = useState(false);

  const fetchWards = useCallback(async () => {
    setLoading(true);
    try {
      const res = await wardAPI.getAll();
      setWards(res.data.data);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchWards(); }, [fetchWards]);

  const openAdd = () => { setForm({ wardNumber: '', wardName: '', type: 'general', totalBeds: 1, chargePerDay: 0, floor: '', description: '' }); setEditWard(null); setShowModal(true); };
  const openEdit = (w) => { setForm({ wardNumber: w.wardNumber, wardName: w.wardName, type: w.type, totalBeds: w.totalBeds, chargePerDay: w.chargePerDay, floor: w.floor || '', description: w.description || '' }); setEditWard(w); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editWard) { await wardAPI.update(editWard.id, form); toast.success('Ward updated'); }
      else { await wardAPI.create(form); toast.success('Ward created'); }
      setShowModal(false); fetchWards();
    } catch {} finally { setSaving(false); }
  };

  const typeColor = (t) => ({ cabin: 'badge-blue', ward: 'badge-green', icu: 'badge-red', emergency: 'badge-orange', general: 'badge-gray' }[t] || 'badge-gray');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Ward & Bed Management</h1>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><FiPlus size={16} /> Add Ward</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 text-center py-10 text-slate-400">Loading...</div>
        ) : wards.map(w => (
          <div key={w.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-semibold text-slate-800">{w.wardName}</div>
                <div className="text-xs text-slate-400 mt-0.5">#{w.wardNumber} · Floor {w.floor || '—'}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge ${typeColor(w.type)}`}>{w.type}</span>
                <button onClick={() => openEdit(w)} className="p-1 text-slate-400 hover:text-blue-600"><FiEdit2 size={14} /></button>
              </div>
            </div>
            {/* Bed occupancy bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>{w.occupiedBeds} occupied</span>
                <span>{w.totalBeds - w.occupiedBeds} available</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${w.occupiedBeds / w.totalBeds >= 0.9 ? 'bg-red-500' : w.occupiedBeds / w.totalBeds >= 0.7 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(100, (w.occupiedBeds / w.totalBeds) * 100)}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total Beds: <strong>{w.totalBeds}</strong></span>
              <span className="text-slate-500">৳{parseFloat(w.chargePerDay).toLocaleString()}/day</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800">{editWard ? 'Edit Ward' : 'Add Ward'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Ward Number *</label><input required value={form.wardNumber} onChange={e => setForm({...form, wardNumber: e.target.value})} className="input-field" placeholder="W-001" disabled={!!editWard} /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Ward Name *</label><input required value={form.wardName} onChange={e => setForm({...form, wardName: e.target.value})} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="input-field">
                  {['cabin','ward','icu','emergency','general'].map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                </select>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Floor</label><input value={form.floor} onChange={e => setForm({...form, floor: e.target.value})} className="input-field" placeholder="Ground, 1st..." /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Total Beds *</label><input type="number" required value={form.totalBeds} onChange={e => setForm({...form, totalBeds: e.target.value})} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Charge/Day (BDT)</label><input type="number" value={form.chargePerDay} onChange={e => setForm({...form, chargePerDay: e.target.value})} className="input-field" /></div>
              <div className="col-span-2"><label className="block text-sm font-medium text-slate-700 mb-1">Description</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} className="input-field" /></div>
              <div className="col-span-2 flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : editWard ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}