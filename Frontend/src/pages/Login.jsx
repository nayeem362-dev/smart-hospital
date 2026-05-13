import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate('/dashboard');
    } catch {
      // error handled by axios interceptor
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (email, password) => setForm({ email, password });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-blue-700 font-bold text-3xl">H</span>
          </div>
          <h1 className="text-white text-2xl font-bold">Smart Hospital</h1>
          <p className="text-blue-200 text-sm mt-1">Management System</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* ✅ Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <div className="relative flex items-center">
                <FiMail
                  className="absolute left-3 text-slate-400 pointer-events-none z-10"
                  size={16}
                />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full border border-slate-300 rounded-lg text-sm bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ paddingTop: '0.625rem', paddingBottom: '0.625rem', paddingLeft: '2.25rem', paddingRight: '0.75rem' }}
                />
              </div>
            </div>

            {/* ✅ Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative flex items-center">
                <FiLock
                  className="absolute left-3 text-slate-400 pointer-events-none z-10"
                  size={16}
                />
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full border border-slate-300 rounded-lg text-sm bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ paddingTop: '0.625rem', paddingBottom: '0.625rem', paddingLeft: '2.25rem', paddingRight: '2.25rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 z-10"
                >
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

          </form>

          {/* Quick Login */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-500 mb-3 font-medium">Quick Login (Demo)</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Admin',        email: 'admin@hospital.com',          pass: 'Admin@123456',    color: 'bg-blue-50 text-blue-700 border-blue-200' },
                { label: 'Doctor',       email: 'dr.ahmed@hospital.com',       pass: 'Doctor@123',      color: 'bg-green-50 text-green-700 border-green-200' },
                { label: 'Nurse',        email: 'nurse.fatima@hospital.com',   pass: 'Nurse@123',       color: 'bg-purple-50 text-purple-700 border-purple-200' },
                { label: 'Receptionist', email: 'reception@hospital.com',      pass: 'Reception@123',   color: 'bg-orange-50 text-orange-700 border-orange-200' },
              ].map(({ label, email, pass, color }) => (
                <button
                  key={label}
                  onClick={() => quickLogin(email)}
                  className={`text-xs px-3 py-2 rounded-lg border font-medium transition-colors ${color}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}