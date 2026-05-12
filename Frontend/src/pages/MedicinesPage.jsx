import { useState, useEffect, useCallback } from 'react';
import { medicineAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiX, FiSearch, FiEdit2, FiTrash2 } from 'react-icons/fi';

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMed, setEditMed] = useState(null);
  const [form, setForm] = useState({ name: '', genericName: '', category: '', type: 'tablet', unitPrice: 0, stockQuantity: 0, reorderLevel: 10, manufacturer: '', expiryDate: '' });
  const [saving, setSaving] = useState(false);

  const fetchMedicines = useCallback(async () => {
    setLoading(true);
    try {
      const res = await medicineAPI.getAll({ search });
      setMedicines(res.data.data);
    } catch {} finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchMedicines(); }, [fetchMedicines]);

  const openAdd = () => { setForm({ name: '', genericName: '', category: '', type: 'tablet', unitPrice: 0, stockQuantity: 0, reorderLevel: 10, manufacturer: '', expiryDate: '' }); setEditMed(null); setShowModal(true); };
  const openEdit = (m) => { setForm({ name: m.name, genericName: m.genericName || '', category: m.category || '', type: m.type, unitPrice: m.unitPrice, stockQuantity: m.stockQuantity, reorderLevel: m.reorderLevel, manufacturer: m.manufacturer || '', expiryDate: m.expiryDate || '' }); setEditMed(m); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editMed) { await medicineAPI.update(editMed.id, form); toast.success('Medicine updated'); }
      else { await medicineAPI.create(form); toast.success('Medicine added'); }
      setShowModal(false); fetchMedicines();
    } catch {} finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this medicine?')) return;
    try { await medicineAPI.delete(id); toast.success('Medicine deactivated'); fetchMedicines(); } catch {}
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Medicine Inventory</h1>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><FiPlus size={16} /> Add Medicine</button>
      </div>

      <div className="relative max-w-sm">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search medicines..." className="input-field pl-9" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="table-header">Code</th>
                <th className="table-header">Name</th>
                <th className="table-header">Generic</th>
                <th className="table-header">Category</th>
                <th className="table-header">Type</th>
                <th className="table-header">Price</th>
                <th className="table-header">Stock</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-10 text-slate-400">Loading...</td></tr>
              ) : medicines.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-slate-400">No medicines found</td></tr>
              ) : medicines.map(m => (
                <tr key={m.id} className="table-row">
                  <td className="table-cell font-mono text-xs text-blue-600">{m.medicineCode}</td>
                  <td className="table-cell font-medium">{m.name}</td>
                  <td className="table-cell text-slate-500">{m.genericName || '—'}</td>
                  <td className="table-cell">{m.category || '—'}</td>
                  <td className="table-cell capitalize">{m.type}</td>
                  <td className="table-cell">৳{parseFloat(m.unitPrice).toFixed(2)}</td>
                  <td className="table-cell">
                    <span className={`badge ${m.stockQuantity <= m.reorderLevel ? 'badge-red' : 'badge-green'}`}>{m.stockQuantity}</span>
                  </td>
                  <td className="table-cell">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(m)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><FiEdit2 size={14} /></button>
                      <button onClick={() => handleDelete(m.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><FiTrash2 size={14} /></button>
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
          <div className="modal-content max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800">{editMed ? 'Edit Medicine' : 'Add Medicine'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2"><label className="block text-sm font-medium text-slate-700 mb-1">Medicine Name *</label><input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Generic Name</label><input value={form.genericName} onChange={e => setForm({...form, genericName: e.target.value})} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Category</label><input value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="input-field">
                  {['tablet','capsule','syrup','injection','cream','drops','other'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Unit Price (BDT) *</label><input type="number" required step="0.01" value={form.unitPrice} onChange={e => setForm({...form, unitPrice: e.target.value})} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Stock Quantity</label><input type="number" value={form.stockQuantity} onChange={e => setForm({...form, stockQuantity: e.target.value})} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Reorder Level</label><input type="number" value={form.reorderLevel} onChange={e => setForm({...form, reorderLevel: e.target.value})} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Manufacturer</label><input value={form.manufacturer} onChange={e => setForm({...form, manufacturer: e.target.value})} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label><input type="date" value={form.expiryDate} onChange={e => setForm({...form, expiryDate: e.target.value})} className="input-field" /></div>
              <div className="col-span-2 flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : editMed ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}