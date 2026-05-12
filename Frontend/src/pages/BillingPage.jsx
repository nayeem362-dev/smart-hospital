import { useState, useEffect, useCallback } from 'react';
import { billingAPI, patientAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiX, FiDownload, FiDollarSign } from 'react-icons/fi';

export default function BillingPage() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [patients, setPatients] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ patientId: '', billType: 'opd', discount: 0, tax: 0, notes: '', items: [{ description: '', amount: 0 }] });
  const [payForm, setPayForm] = useState({ amount: 0, paymentMethod: 'cash', transactionRef: '' });

  const fetchBills = useCallback(async () => {
    setLoading(true);
    try {
      const res = await billingAPI.getAll();
      setBills(res.data.data);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchBills(); }, [fetchBills]);

  const openCreate = async () => {
    const res = await patientAPI.getAll({ limit: 100 });
    setPatients(res.data.data);
    setShowCreateModal(true);
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { description: '', amount: 0 }] });
  const removeItem = (i) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });
  const updateItem = (i, key, val) => {
    const items = [...form.items];
    items[i] = { ...items[i], [key]: val };
    setForm({ ...form, items });
  };

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await billingAPI.create(form);
      toast.success('Bill created');
      setShowCreateModal(false); fetchBills();
    } catch {} finally { setSaving(false); }
  };

  const openPay = (bill) => {
    setSelectedBill(bill);
    setPayForm({ amount: bill.dueAmount, paymentMethod: 'cash', transactionRef: '' });
    setShowPayModal(true);
  };

  const handlePay = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await billingAPI.makePayment(selectedBill.id, payForm);
      toast.success('Payment recorded');
      setShowPayModal(false); fetchBills();
    } catch {} finally { setSaving(false); }
  };

  const handleDownloadPDF = async (id) => {
    try {
      const res = await billingAPI.downloadPDF(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url; a.download = `invoice-${id}.pdf`;
      a.click(); window.URL.revokeObjectURL(url);
    } catch { toast.error('Failed to download PDF'); }
  };

  const statusColor = (s) => ({ pending: 'badge-yellow', partial: 'badge-blue', paid: 'badge-green', cancelled: 'badge-red' }[s] || 'badge-gray');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Billing & Payments</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2"><FiPlus size={16} /> Create Bill</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="table-header">Bill #</th>
                <th className="table-header">Patient</th>
                <th className="table-header">Type</th>
                <th className="table-header">Total</th>
                <th className="table-header">Paid</th>
                <th className="table-header">Due</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-10 text-slate-400">Loading...</td></tr>
              ) : bills.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-slate-400">No bills found</td></tr>
              ) : bills.map(b => (
                <tr key={b.id} className="table-row">
                  <td className="table-cell font-mono text-xs text-blue-600">{b.billNumber}</td>
                  <td className="table-cell">
                    <div className="font-medium">{b.patient?.name}</div>
                    <div className="text-xs text-slate-400">{b.patient?.patientId}</div>
                  </td>
                  <td className="table-cell capitalize">{b.billType}</td>
                  <td className="table-cell font-medium">৳{parseFloat(b.totalAmount).toLocaleString()}</td>
                  <td className="table-cell text-green-600">৳{parseFloat(b.paidAmount).toLocaleString()}</td>
                  <td className="table-cell text-red-600 font-medium">৳{parseFloat(b.dueAmount).toLocaleString()}</td>
                  <td className="table-cell"><span className={`badge ${statusColor(b.status)}`}>{b.status}</span></td>
                  <td className="table-cell">
                    <div className="flex gap-2">
                      {b.status !== 'paid' && (
                        <button onClick={() => openPay(b)} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Record Payment">
                          <FiDollarSign size={14} />
                        </button>
                      )}
                      <button onClick={() => handleDownloadPDF(b.id)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Download PDF">
                        <FiDownload size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Bill Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800">Create Bill</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Patient *</label>
                  <select required value={form.patientId} onChange={e => setForm({...form, patientId: e.target.value})} className="input-field">
                    <option value="">Select Patient</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.patientId})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Bill Type</label>
                  <select value={form.billType} onChange={e => setForm({...form, billType: e.target.value})} className="input-field">
                    {['opd','admission','emergency','diagnostic','consultation'].map(t => (
                      <option key={t} value={t}>{t.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Discount (BDT)</label>
                  <input type="number" value={form.discount} onChange={e => setForm({...form, discount: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tax (%)</label>
                  <input type="number" value={form.tax} onChange={e => setForm({...form, tax: e.target.value})} className="input-field" />
                </div>
              </div>

              {/* Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700">Bill Items</label>
                  <button type="button" onClick={addItem} className="text-xs text-blue-600 hover:underline">+ Add Item</button>
                </div>
                {form.items.map((item, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input placeholder="Description" value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} className="input-field flex-1" required />
                    <input type="number" placeholder="Amount" value={item.amount} onChange={e => updateItem(i, 'amount', parseFloat(e.target.value) || 0)} className="input-field w-28" required />
                    {form.items.length > 1 && (
                      <button type="button" onClick={() => removeItem(i)} className="text-red-500 hover:text-red-700"><FiX size={16} /></button>
                    )}
                  </div>
                ))}
                <div className="text-sm font-semibold text-slate-700 mt-2">
                  Subtotal: ৳{form.items.reduce((s, item) => s + (parseFloat(item.amount) || 0), 0).toLocaleString()}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} className="input-field" />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Creating...' : 'Create Bill'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Modal */}
      {showPayModal && selectedBill && (
        <div className="modal-overlay">
          <div className="modal-content max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800">Record Payment</h2>
              <button onClick={() => setShowPayModal(false)} className="text-slate-400 hover:text-slate-600"><FiX size={20} /></button>
            </div>
            <form onSubmit={handlePay} className="p-6 space-y-4">
              <div className="bg-slate-50 rounded-lg p-4 text-sm">
                <div className="flex justify-between mb-1"><span className="text-slate-500">Bill #</span><span className="font-mono">{selectedBill.billNumber}</span></div>
                <div className="flex justify-between mb-1"><span className="text-slate-500">Total</span><span className="font-semibold">৳{parseFloat(selectedBill.totalAmount).toLocaleString()}</span></div>
                <div className="flex justify-between mb-1"><span className="text-slate-500">Paid</span><span className="text-green-600">৳{parseFloat(selectedBill.paidAmount).toLocaleString()}</span></div>
                <div className="flex justify-between font-bold"><span>Due</span><span className="text-red-600">৳{parseFloat(selectedBill.dueAmount).toLocaleString()}</span></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (BDT) *</label>
                <input type="number" required value={payForm.amount} onChange={e => setPayForm({...payForm, amount: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
                <select value={payForm.paymentMethod} onChange={e => setPayForm({...payForm, paymentMethod: e.target.value})} className="input-field">
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="mobile_banking">Mobile Banking</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="insurance">Insurance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Transaction Reference</label>
                <input value={payForm.transactionRef} onChange={e => setPayForm({...payForm, transactionRef: e.target.value})} className="input-field" placeholder="Transaction ID (optional)" />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowPayModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-success">{saving ? 'Processing...' : 'Confirm Payment'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}