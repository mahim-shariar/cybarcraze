import React, { useState } from 'react';
import { CyberLogo } from '../../components/CyberLogo';
import {
  LayoutDashboard,
  CalendarDays,
  CalendarCheck,
  Gamepad2,
  Layers,
  Coins,
  Users,
  Timer,
  QrCode,
  BarChart3,
  Clock,
  History,
  Settings,
  ShoppingBag,
  Plus,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  Crown,
  LogOut
} from 'lucide-react';
import { StaffAuthSession } from './AdminLoginModal';

interface Props {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  navigate: (path: string) => void;
  onOpenWalkIn: () => void;
  onOpenNewDevice: () => void;
  onOpenCheckIn: () => void;
  authSession?: StaffAuthSession | null;
  onLogout?: () => void;
  children: React.ReactNode;
}

export type AdminRole = 'SUPER_ADMIN' | 'MANAGER' | 'STAFF';

export const AdminLayout: React.FC<Props> = ({
  currentTab,
  setCurrentTab,
  navigate,
  onOpenWalkIn,
  onOpenNewDevice,
  onOpenCheckIn,
  authSession,
  onLogout,
  children
}) => {
  const currentRole: AdminRole = authSession?.role || 'SUPER_ADMIN';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'MANAGER', 'STAFF'] },
    { id: 'sessions', label: 'Active Sessions', icon: Timer, roles: ['SUPER_ADMIN', 'MANAGER', 'STAFF'] },
    { id: 'bookings', label: 'Bookings Manager', icon: CalendarCheck, roles: ['SUPER_ADMIN', 'MANAGER', 'STAFF'] },
    { id: 'calendar', label: 'Booking Calendar', icon: CalendarDays, roles: ['SUPER_ADMIN', 'MANAGER', 'STAFF'] },
    { id: 'checkin', label: 'Counter Check-In', icon: QrCode, roles: ['SUPER_ADMIN', 'MANAGER', 'STAFF'] },
    { id: 'vippasses', label: 'VIP Gaming Passes', icon: Crown, roles: ['SUPER_ADMIN', 'MANAGER', 'STAFF'] },
    { id: 'devices', label: 'Devices Fleet', icon: Gamepad2, roles: ['SUPER_ADMIN', 'MANAGER'] },
    { id: 'categories', label: 'Device Categories', icon: Layers, roles: ['SUPER_ADMIN', 'MANAGER'] },
    { id: 'pricing', label: 'Pricing & Promos', icon: Coins, roles: ['SUPER_ADMIN', 'MANAGER'] },
    { id: 'customers', label: 'Customer CRM', icon: Users, roles: ['SUPER_ADMIN', 'MANAGER'] },
    { id: 'staff', label: 'Staff & Manager Roster', icon: UserCheck, roles: ['SUPER_ADMIN', 'MANAGER'] },
    { id: 'opening-hours', label: 'Hours & Maintenance', icon: Clock, roles: ['SUPER_ADMIN', 'MANAGER'] },
    { id: 'activity-logs', label: 'Activity Logs', icon: History, roles: ['SUPER_ADMIN'] },
    { id: 'settings', label: 'Cafe Settings', icon: Settings, roles: ['SUPER_ADMIN'] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(currentRole));

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 flex flex-col font-sans">
      {/* Top Admin Global Bar */}
      <header className="sticky top-0 z-40 bg-[#0c101a]/95 backdrop-blur border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-1.5 text-slate-300 hover:text-white rounded-md cursor-pointer"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <div className="cursor-pointer" onClick={() => navigate('/admin')}>
            <CyberLogo variant="compact" size="sm" />
          </div>

          <span className="hidden sm:inline-block text-slate-700">|</span>
          <span className="hidden sm:inline-block text-xs font-semibold text-slate-300">
            Staff & Management Console
          </span>
        </div>

        {/* Center/Right Actions & Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Action Buttons */}
          <button
            onClick={onOpenWalkIn}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg shadow-subtle flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Walk-In</span>
          </button>

          <button
            onClick={onOpenCheckIn}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5 text-blue-400" />
            <span>Check In</span>
          </button>

          {/* Authenticated Staff User Pill */}
          {authSession ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-semibold text-white leading-tight">
                  {authSession.displayName}
                </span>
                <span className="text-[10px] text-blue-400 font-mono leading-tight">
                  {authSession.email}
                </span>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                currentRole === 'SUPER_ADMIN' 
                  ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                  : currentRole === 'MANAGER'
                  ? 'bg-blue-950 text-blue-300 border border-blue-800/60'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
              }`}>
                {currentRole === 'SUPER_ADMIN' ? 'Admin' : currentRole === 'MANAGER' ? 'Manager' : 'Staff'}
              </span>
              {onLogout && (
                <button
                  onClick={onLogout}
                  title="Sign out of Staff Portal"
                  className="p-1.5 bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-800 rounded-lg transition-colors cursor-pointer ml-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Admin Mode</span>
            </div>
          )}

          <button
            onClick={() => navigate('/')}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 pl-2 border-l border-slate-800 cursor-pointer"
            title="View Public Website"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Live Site</span>
          </button>
        </div>
      </header>

      {/* Main Admin Workspace (Sidebar + Content) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-[#0d121c] border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-60px)]">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-2">
              Menu
            </div>
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sidebar Footer info */}
          <div className="p-4 border-t border-slate-800/80 bg-slate-900/60 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Floor Sync Active</span>
            </div>
            <div className="text-slate-400 mt-0.5 text-[11px]">Mymensingh HQ · Asia/Dhaka</div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#0a0d14] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
