import { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import {
  FiUsers, FiUserPlus, FiAlertCircle, FiDollarSign,
  FiCalendar, FiActivity, FiHeart, FiHome, FiGrid
} from 'react-icons/fi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="stat-card">
    <div className="flex items-center justify-between mb-3">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
    </div>
    <div className="text-2xl font-bold text-slate-800">{value ?? '—'}</div>
    <div className="text-sm text-slate-500 mt-0.5">{label}</div>
    {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
  </div>
);

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getAdminStats()
      .then(res => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );

  const stats = data?.stats || {};
  const pieData = (data?.patientsByStatus || []).map(p => ({
    name: p.status,
    value: parseInt(p.count),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
        <p className="text-slate-500 text-sm mt-1">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FiUsers}       label="Total Patients"       value={stats.totalPatients}      color="bg-blue-500"   />
        <StatCard icon={FiUserPlus}    label="Total Doctors"        value={stats.totalDoctors}       color="bg-green-500"  />
        <StatCard icon={FiHeart}       label="Total Nurses"         value={stats.totalNurses}        color="bg-purple-500" />
        <StatCard icon={FiAlertCircle} label="Emergency Active"     value={stats.emergencyActive}    color="bg-red-500"    />
        <StatCard icon={FiHome}        label="Total Beds"           value={stats.totalBeds}          color="bg-teal-500"   sub={`${stats.availableBeds ?? 0} available`} />
        <StatCard icon={FiGrid}        label="Occupied Beds"        value={stats.occupiedBeds}       color="bg-orange-500" sub={`${stats.bedOccupancyRate ?? 0}% occupancy`} />
        <StatCard icon={FiCalendar}    label="Today's Appointments" value={stats.todayAppointments}  color="bg-indigo-500" />
        <StatCard icon={FiDollarSign}  label="Monthly Revenue"      value={`৳${(stats.monthlyRevenue || 0).toLocaleString()}`} color="bg-emerald-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-4">Monthly Revenue (BDT)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data?.revenueChart || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-4">Patient Status</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-52 text-slate-400 text-sm">
              No data available
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Recent Patients</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="table-header">Patient ID</th>
                <th className="table-header">Name</th>
                <th className="table-header">Age</th>
                <th className="table-header">Gender</th>
                <th className="table-header">Status</th>
                <th className="table-header">Phone</th>
              </tr>
            </thead>
            <tbody>
              {(data?.recentPatients || []).map(p => (
                <tr key={p.id} className="table-row">
                  <td className="table-cell font-mono text-xs text-blue-600">{p.patientId}</td>
                  <td className="table-cell font-medium">{p.name}</td>
                  <td className="table-cell">{p.age}</td>
                  <td className="table-cell capitalize">{p.gender}</td>
                  <td className="table-cell">
                    <span className={`badge ${
                      p.status === 'active'    ? 'badge-green' :
                      p.status === 'admitted'  ? 'badge-blue'  :
                      p.status === 'emergency' ? 'badge-red'   : 'badge-gray'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="table-cell">{p.phone}</td>
                </tr>
              ))}
              {(data?.recentPatients || []).length === 0 && (
                <tr>
                  <td colSpan={6} className="table-cell text-center text-slate-400 py-8">
                    No patients found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}