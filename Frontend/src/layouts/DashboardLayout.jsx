import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiHome, FiUsers, FiUserPlus, FiAlertCircle, FiActivity,
  FiCalendar, FiDollarSign, FiLogOut, FiMenu,
  FiPackage, FiGrid, FiHeart, FiDroplet
} from 'react-icons/fi';

const navItems = [
  { to: '/dashboard',    icon: FiHome,        label: 'Dashboard'    },
  { to: '/patients',     icon: FiUsers,        label: 'Patients'     },
  { to: '/doctors',      icon: FiUserPlus,     label: 'Doctors'      },
  { to: '/emergency',    icon: FiAlertCircle,  label: 'Emergency'    },
  { to: '/diagnostics',  icon: FiActivity,     label: 'Diagnostics'  },
  { to: '/appointments', icon: FiCalendar,     label: 'Appointments' },
  { to: '/admissions',   icon: FiDroplet,      label: 'Admissions'   },
  { to: '/billing',      icon: FiDollarSign,   label: 'Billing'      },
  { to: '/discharge',    icon: FiHeart,        label: 'Discharge'    },
  { to: '/medicines',    icon: FiPackage,      label: 'Medicines'    },
  { to: '/wards',        icon: FiGrid,         label: 'Wards'        },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-blue-700">
        <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
          <span className="text-blue-700 font-bold text-lg">H</span>
        </div>
        <div>
          <div className="text-white font-semibold text-sm leading-tight">Smart Hospital</div>
          <div className="text-blue-300 text-xs">Management System</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-white text-blue-700'
                  : 'text-blue-100 hover:bg-blue-700 hover:text-white'
              }`
            }
            onClick={() => setSidebarOpen(false)}
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-blue-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-medium truncate">{user?.name}</div>
            <div className="text-blue-300 text-xs capitalize">
              {user?.role?.replace('_', ' ')}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-blue-200 hover:text-white hover:bg-blue-700 rounded-lg text-sm transition-colors"
        >
          <FiLogOut size={15} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="hidden lg:flex w-60 bg-blue-800 flex-col flex-shrink-0">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-blue-800 flex flex-col z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <button
            className="lg:hidden text-slate-600 hover:text-slate-900"
            onClick={() => setSidebarOpen(true)}
          >
            <FiMenu size={22} />
          </button>
          <div className="hidden lg:block">
            <h1 className="text-lg font-semibold text-slate-800">
              Smart Hospital Management System
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">
              {new Date().toLocaleDateString('en-BD', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}