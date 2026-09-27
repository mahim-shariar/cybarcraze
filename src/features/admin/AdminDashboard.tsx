import React, { useState, useEffect } from 'react';
import { cyberStore } from '../../lib/cyberStore';
import { Device, Booking, ActiveSession } from '../../types';
import {
  DollarSign,
  CalendarCheck,
  Radio,
  Gamepad2,
  Users,
  Timer,
  AlertCircle,
  Plus,
  QrCode,
  ChevronRight,
  Clock,
  CheckCircle2,
  Play
} from 'lucide-react';

interface Props {
  setCurrentTab: (tab: string) => void;
  onOpenWalkIn: () => void;
  onOpenNewDevice: () => void;
  onOpenCheckIn: () => void;
}

export const AdminDashboard: React.FC<Props> = ({
  setCurrentTab,
  onOpenWalkIn,
  onOpenNewDevice,
  onOpenCheckIn
}) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [sessions, setSessions] = useState<ActiveSession[]>([]);

  useEffect(() => {
    const sync = () => {
      setDevices(cyberStore.getDevices());
      setBookings(cyberStore.getBookings());
      setSessions(cyberStore.getSessions().filter(s => s.status === 'ACTIVE'));
    };
    sync();
    return cyberStore.subscribe(sync);
  }, []);

  // Compute Metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter(b => b.date === todayStr);

  const availableDevices = devices.filter(d => d.status === 'AVAILABLE' && d.active).length;
  const occupiedDevices = devices.filter(d => d.status === 'OCCUPIED' && d.active).length;
  const maintenanceDevices = devices.filter(d => d.status === 'MAINTENANCE').length;
  const completedToday = todayBookings.filter(b => b.status === 'COMPLETED').length;
  const pendingPayments = todayBookings.filter(b => b.paymentStatus === 'PENDING' || b.remainingAmount > 0).length;

  return (
    <div className="space-y-8">
      {/* Welcome & Quick Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="text-xs font-chakra tracking-widest text-cyan-400 uppercase">
            CyberCraze Operational Dashboard
          </div>
          <h1 className="font-orbitron font-extrabold text-2xl sm:text-3xl text-white mt-1">
            TODAY'S OPERATIONS OVERVIEW
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Real-time feed for Akua Hazibari HQ · {todayStr}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenWalkIn}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-pink-500 text-slate-950 font-orbitron font-bold text-xs tracking-wider rounded shadow-neon-cyan flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>NEW WALK-IN</span>
          </button>

          <button
            onClick={onOpenCheckIn}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-500/40 font-chakra font-bold text-xs rounded transition-colors flex items-center gap-1.5"
          >
            <QrCode className="w-4 h-4" />
            <span>SCAN QR</span>
          </button>

          <button
            onClick={() => setCurrentTab('sessions')}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-blue-400 border border-blue-500/30 font-chakra font-bold text-xs rounded transition-colors flex items-center gap-1.5"
          >
            <Timer className="w-4 h-4" />
            <span>ACTIVE SESSIONS</span>
          </button>

          <button
            onClick={onOpenNewDevice}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-chakra font-bold text-xs rounded transition-colors flex items-center gap-1.5"
          >
            <Gamepad2 className="w-4 h-4 text-slate-400" />
            <span>ADD DEVICE</span>
          </button>
        </div>
      </div>

      {/* METRIC STATS TILES (4 CARDS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Completed Sessions Today */}
        <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-chakra uppercase">
            <span>Completed Today</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-orbitron font-extrabold text-2xl sm:text-3xl text-white mt-2">
            {completedToday}
          </div>
          <div className="text-[11px] text-slate-500 font-chakra mt-1">
            Finished match sessions today
          </div>
        </div>

        {/* Active Sessions */}
        <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-chakra uppercase">
            <span>Active Sessions</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div className="font-orbitron font-extrabold text-2xl sm:text-3xl text-cyan-400 mt-2">
            {sessions.length}
          </div>
          <div className="text-[11px] text-slate-500 font-chakra mt-1">
            {occupiedDevices} stations currently occupied
          </div>
        </div>

        {/* Available Stations */}
        <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-chakra uppercase">
            <span>Available Devices</span>
            <span className="text-cyan-400 font-chakra text-[10px]">READY</span>
          </div>
          <div className="font-orbitron font-extrabold text-2xl sm:text-3xl text-emerald-400 mt-2">
            {availableDevices} <span className="text-sm font-normal text-slate-500">/ {devices.length}</span>
          </div>
          <div className="text-[11px] text-slate-500 font-chakra mt-1">
            {maintenanceDevices > 0 ? `${maintenanceDevices} in maintenance` : 'Fleet 100% operational'}
          </div>
        </div>

        {/* Today's Total Bookings */}
        <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-chakra uppercase">
            <span>Today's Bookings</span>
            <span className="text-pink-400 font-chakra text-[10px]">TOTAL</span>
          </div>
          <div className="font-orbitron font-extrabold text-2xl sm:text-3xl text-pink-400 mt-2">
            {todayBookings.length}
          </div>
          <div className="text-[11px] text-slate-500 font-chakra mt-1">
            {pendingPayments} awaiting counter settlement
          </div>
        </div>
      </div>

      {/* TODAY'S BOOKINGS SCHEDULE TABLE */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-orbitron font-bold text-base text-white flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-pink-400" />
            TODAY'S RESERVATIONS QUEUE ({todayBookings.length})
          </h3>
          <button
            onClick={() => setCurrentTab('bookings')}
            className="text-xs font-chakra text-cyan-400 hover:text-cyan-300 font-semibold"
          >
            VIEW ALL BOOKINGS →
          </button>
        </div>

        {todayBookings.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 font-chakra">
            No bookings scheduled for today yet. Use "+ WALK-IN" to register an in-store gamer.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-chakra">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                  <th className="pb-3">Slot Time</th>
                  <th className="pb-3">Station</th>
                  <th className="pb-3">Customer / Mobile</th>
                  <th className="pb-3">Duration</th>
                  <th className="pb-3">Bill & Due</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {todayBookings.slice(0, 6).map((b) => (
                  <tr key={b.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 font-orbitron font-bold text-white">
                      {b.startTime} – {b.endTime}
                    </td>
                    <td className="py-3">
                      <span className="font-orbitron text-cyan-400 font-bold">{b.deviceCode}</span>
                      <span className="text-slate-400 text-[11px] block truncate">{b.deviceName}</span>
                    </td>
                    <td className="py-3">
                      <div className="text-white font-medium">{b.customerName}</div>
                      <div className="text-slate-500 text-[11px]">{b.customerPhone}</div>
                    </td>
                    <td className="py-3 text-slate-300">{b.durationMinutes} min</td>
                    <td className="py-3">
                      <div className="font-orbitron font-bold text-white">৳{b.totalAmount}</div>
                      {b.remainingAmount > 0 ? (
                        <span className="text-[10px] text-pink-400">৳{b.remainingAmount} due</span>
                      ) : (
                        <span className="text-[10px] text-emerald-400">Paid in Full</span>
                      )}
                    </td>
                    <td className="py-3">
                      <span className={`text-[11px] uppercase font-bold ${
                        b.status === 'CONFIRMED' ? 'text-sky-400' :
                        b.status === 'ACTIVE' ? 'text-emerald-400 animate-pulse' :
                        b.status === 'COMPLETED' ? 'text-slate-400' :
                        'text-rose-400'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {b.status === 'CONFIRMED' && (
                        <button
                          onClick={() => cyberStore.checkInAndStartSession(b.id)}
                          className="px-2.5 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-orbitron font-bold text-[10px] rounded transition-all inline-flex items-center gap-1"
                        >
                          <Play className="w-3 h-3 fill-slate-950" />
                          <span>START</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
