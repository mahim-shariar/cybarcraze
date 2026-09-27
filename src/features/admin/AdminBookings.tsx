import React, { useState, useEffect } from 'react';
import { cyberStore } from '../../lib/cyberStore';
import { Booking, DeviceCategory } from '../../types';
import { CyberQRCode } from '../../components/CyberQRCode';
import {
  Search,
  Filter,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Play,
  Printer,
  Copy,
  Check,
  Eye,
  AlertTriangle
} from 'lucide-react';

export const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [categories, setCategories] = useState<DeviceCategory[]>([]);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedBookingModal, setSelectedBookingModal] = useState<Booking | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const sync = () => {
      setBookings(cyberStore.getBookings());
      setCategories(cyberStore.getCategories());
    };
    sync();
    return cyberStore.subscribe(sync);
  }, []);

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;
    if (dateFilter && b.date !== dateFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = b.customerName.toLowerCase().includes(q);
      const matchPhone = b.customerPhone.includes(q);
      const matchId = b.id.toLowerCase().includes(q);
      const matchDevice = b.deviceCode.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchId && !matchDevice) return false;
    }
    return true;
  });

  const handleStartSession = (bookingId: string) => {
    cyberStore.checkInAndStartSession(bookingId);
  };

  const handleCancelBooking = (bookingId: string) => {
    cyberStore.cancelBooking(bookingId, 'Admin counter cancellation');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="text-xs font-chakra tracking-widest text-cyan-400 uppercase">
            Operational Bookings Database
          </div>
          <h1 className="font-orbitron font-extrabold text-2xl sm:text-3xl text-white mt-1">
            BOOKINGS & RESERVATIONS
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Real-time searchable register of all guest and walk-in reservations.
          </p>
        </div>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Search */}
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, phone, Booking ID, or station code..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded text-xs text-white placeholder-slate-600 focus:outline-none"
          />
        </div>

        {/* Status Filter */}
        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded text-xs text-white focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="ACTIVE">ACTIVE (In Progress)</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        {/* Date Filter */}
        <div className="sm:col-span-3">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded text-xs text-white focus:outline-none"
          />
        </div>
      </div>

      {/* BOOKINGS TABLE */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-chakra">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                <th className="py-3 px-4">Booking ID & Pass</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Station</th>
                <th className="py-3 px-4">Schedule</th>
                <th className="py-3 px-4">Billing</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    No reservations match the specified filters.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-orbitron font-bold text-cyan-400 block">{b.id}</span>
                      <span className="text-[10px] text-slate-500">Code: {b.accessCode}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-white font-medium">{b.customerName}</div>
                      <div className="text-slate-400 text-[11px]">{b.customerPhone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-orbitron font-bold text-white">{b.deviceCode}</span>
                      <span className="text-slate-400 text-[11px] block">{b.categoryName}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-200">{b.date}</div>
                      <div className="text-cyan-400 text-[11px]">{b.startTime}–{b.endTime} ({b.durationMinutes}m)</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-orbitron font-bold text-white">৳{b.totalAmount}</div>
                      {b.remainingAmount > 0 ? (
                        <span className="text-[10px] text-pink-400 font-semibold">Due: ৳{b.remainingAmount}</span>
                      ) : (
                        <span className="text-[10px] text-emerald-400">Paid in Full</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[11px] uppercase font-bold ${
                        b.status === 'CONFIRMED' ? 'text-sky-400' :
                        b.status === 'ACTIVE' ? 'text-emerald-400 animate-pulse' :
                        b.status === 'COMPLETED' ? 'text-slate-400' :
                        'text-rose-400'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {b.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleStartSession(b.id)}
                            title="Start Active Session"
                            className="p-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded transition-all"
                          >
                            <Play className="w-3.5 h-3.5 fill-slate-950" />
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedBookingModal(b)}
                          title="View QR & Details"
                          className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-700"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {b.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleCancelBooking(b.id)}
                            title="Cancel Booking"
                            className="p-1.5 bg-slate-900 hover:bg-rose-950 text-rose-400 rounded border border-slate-800"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL & QR POPUP MODAL */}
      {selectedBookingModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-cyan-500/40 rounded-xl p-6 max-w-lg w-full shadow-neon-cyan space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-chakra text-slate-400 uppercase">RESERVATION PASS</span>
                <h3 className="font-orbitron font-extrabold text-xl text-white">{selectedBookingModal.id}</h3>
              </div>
              <button
                onClick={() => setSelectedBookingModal(null)}
                className="text-slate-400 hover:text-white text-xs font-chakra"
              >
                ✕ Close
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-950 border border-slate-800 rounded-lg">
              <CyberQRCode value={selectedBookingModal.qrCodeData} size={140} />
              <div className="space-y-1 text-xs font-chakra text-center sm:text-left">
                <div className="text-slate-400">Access Code: <strong className="text-pink-400 font-orbitron">{selectedBookingModal.accessCode}</strong></div>
                <div className="text-white font-bold">{selectedBookingModal.customerName}</div>
                <div className="text-slate-400">{selectedBookingModal.customerPhone}</div>
                <div className="text-cyan-400 font-orbitron font-bold pt-1">{selectedBookingModal.deviceCode} · {selectedBookingModal.deviceName}</div>
                <div className="text-slate-400">{selectedBookingModal.date} ({selectedBookingModal.startTime}–{selectedBookingModal.endTime})</div>
              </div>
            </div>

            <div className="p-3 bg-slate-950/60 rounded border border-slate-800 text-xs font-chakra space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Charge</span>
                <span className="font-orbitron font-bold text-white">৳{selectedBookingModal.totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Remaining Due</span>
                <span className="font-orbitron font-bold text-pink-400">৳{selectedBookingModal.remainingAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Status</span>
                <span className="font-bold text-emerald-400">{selectedBookingModal.paymentStatus}</span>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-slate-900 text-slate-300 font-chakra text-xs rounded hover:bg-slate-800 flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Slip</span>
              </button>
              {selectedBookingModal.status === 'CONFIRMED' && (
                <button
                  onClick={() => {
                    handleStartSession(selectedBookingModal.id);
                    setSelectedBookingModal(null);
                  }}
                  className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-orbitron font-bold text-xs rounded shadow-neon-cyan"
                >
                  Start Session Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
