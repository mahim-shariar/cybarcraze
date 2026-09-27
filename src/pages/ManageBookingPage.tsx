import React, { useState, useEffect } from 'react';
import { cyberStore } from '../lib/cyberStore';
import { Booking } from '../types';
import { CyberQRCode } from '../components/CyberQRCode';
import {
  Search,
  CheckCircle2,
  Printer,
  XCircle,
  RefreshCw,
  AlertTriangle,
  Copy,
  Check,
  X
} from 'lucide-react';

interface Props {
  navigate: (path: string) => void;
  directBookingId?: string;
}

export const ManageBookingPage: React.FC<Props> = ({ navigate, directBookingId }) => {
  const [bookingIdInput, setBookingIdInput] = useState<string>(directBookingId || '');
  const [phoneOrCodeInput, setPhoneOrCodeInput] = useState<string>('');
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [associatedBookings, setAssociatedBookings] = useState<Booking[]>([]);
  const [searchError, setSearchError] = useState<string>('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Reschedule Modal State
  const [isRescheduling, setIsRescheduling] = useState<boolean>(false);
  const [newDate, setNewDate] = useState<string>('');
  const [newTime, setNewTime] = useState<string>('16:00');
  const [rescheduleError, setRescheduleError] = useState<string>('');

  // Cancel Confirmation Modal State
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>('');

  // If directBookingId is passed, try auto-lookup
  useEffect(() => {
    if (directBookingId) {
      const match = cyberStore.getBookings().find(b => b.id.toUpperCase() === directBookingId.toUpperCase());
      if (match) {
        setActiveBooking(match);
        setBookingIdInput(match.id);
        setPhoneOrCodeInput(match.accessCode);
        const related = cyberStore.getBookingsByPhone(match.customerPhone);
        setAssociatedBookings(related.filter(b => b.id !== match.id));
      }
    }
  }, [directBookingId]);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    setActionSuccessMsg('');

    if (!bookingIdInput.trim()) {
      setSearchError('Please provide your Booking ID (e.g. CC-2026-000121).');
      return;
    }

    if (!phoneOrCodeInput.trim()) {
      setSearchError('Please provide your phone number or 6-digit access code.');
      return;
    }

    const booking = cyberStore.getBookingByCredentials(bookingIdInput, phoneOrCodeInput);
    if (!booking) {
      setSearchError('No active booking found with these credentials. (Note: Per CyberCraze policy, daily booking records are automatically purged once the reservation day has passed).');
      return;
    }

    setActiveBooking(booking);
    const related = cyberStore.getBookingsByPhone(booking.customerPhone);
    setAssociatedBookings(related.filter(b => b.id !== booking.id));
  };

  const handleExecuteCancel = () => {
    if (!activeBooking) return;
    const res = cyberStore.cancelBooking(activeBooking.id, cancelReason);
    if (res.success) {
      setIsCancelling(false);
      setActionSuccessMsg('Your booking has been cancelled.');
      const updated = cyberStore.getBookings().find(b => b.id === activeBooking.id);
      if (updated) setActiveBooking({ ...updated });
    } else {
      setSearchError(res.message);
    }
  };

  const handleExecuteReschedule = () => {
    if (!activeBooking) return;
    setRescheduleError('');

    if (!newDate) {
      setRescheduleError('Please choose a new date.');
      return;
    }

    const res = cyberStore.rescheduleBooking({
      bookingId: activeBooking.id,
      newDate,
      newStartTime: newTime
    });

    if (res.success) {
      setIsRescheduling(false);
      setActionSuccessMsg('Session rescheduled successfully!');
      const updated = cyberStore.getBookings().find(b => b.id === activeBooking.id);
      if (updated) setActiveBooking({ ...updated });
    } else {
      setRescheduleError(res.message);
    }
  };

  const copyId = () => {
    if (activeBooking) {
      navigator.clipboard.writeText(`${activeBooking.id} (Code: ${activeBooking.accessCode})`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
              Guest Pass Management
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              Find & Manage Your Pass
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Enter your Booking ID and Mobile Number or Access Code. No password or account login required.
            </p>
          </div>
          <button
            onClick={() => navigate('/book')}
            className="text-xs font-medium text-slate-300 hover:text-white py-2 px-3 bg-slate-900 border border-slate-800 rounded-lg transition-colors self-start sm:self-auto cursor-pointer"
          >
            ← Book New Slot
          </button>
        </div>

        {/* LOOKUP FORM */}
        <div className="bg-[#101624] border border-slate-800 rounded-2xl p-6 shadow-card">
          <form onSubmit={handleLookup} className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-5">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Booking ID *
              </label>
              <input
                type="text"
                required
                value={bookingIdInput}
                onChange={(e) => setBookingIdInput(e.target.value.toUpperCase())}
                placeholder="e.g. CC-2026-000121"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg text-xs text-white uppercase font-mono placeholder-slate-600 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-5">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Phone Number or Access Code *
              </label>
              <input
                type="text"
                required
                value={phoneOrCodeInput}
                onChange={(e) => setPhoneOrCodeInput(e.target.value)}
                placeholder="e.g. 01712345678 or 748291"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 flex items-end">
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg shadow-subtle transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Lookup</span>
              </button>
            </div>
          </form>

          {searchError && (
            <div className="mt-4 p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{searchError}</span>
            </div>
          )}

          {actionSuccessMsg && (
            <div className="mt-4 p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{actionSuccessMsg}</span>
            </div>
          )}
        </div>

        {/* BOOKING DETAILS DISPLAY */}
        {activeBooking && (
          <div className="space-y-6">
            {/* ACTIVE SESSION COUNTDOWN BANNER */}
            {activeBooking.status === 'ACTIVE' && (
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Your Play Session is Currently LIVE!</h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Playing on <strong>{activeBooking.deviceName}</strong> ({activeBooking.deviceCode}). Please vacate the station when your time concludes at <strong>{activeBooking.endTime}</strong>.
                    </p>
                  </div>
                </div>
                <div className="text-xs font-mono font-bold text-emerald-300 bg-emerald-900/60 px-3.5 py-1.5 rounded-xl border border-emerald-700/50 self-start sm:self-auto shrink-0">
                  Ending: {activeBooking.endTime}
                </div>
              </div>
            )}

            <div className="bg-[#101624] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-card">
              
              {/* Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Reservation Status:</span>
                    <span className={`text-xs font-semibold ${
                      activeBooking.status === 'CONFIRMED' ? 'text-blue-400' :
                      activeBooking.status === 'ACTIVE' ? 'text-emerald-400' :
                      activeBooking.status === 'COMPLETED' ? 'text-slate-400' :
                      'text-rose-400'
                    }`}>
                      ● {activeBooking.status}
                    </span>
                  </div>
                  <h2 className="font-mono font-bold text-xl sm:text-2xl text-white mt-1">
                    {activeBooking.id}
                  </h2>
                  <div className="text-xs text-slate-300 mt-0.5">
                    Access Code: <span className="font-mono font-semibold text-white">{activeBooking.accessCode}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={copyId}
                    className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied' : 'Copy Pass'}</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print</span>
                  </button>
                </div>
              </div>

              {/* QR and Match Timing */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-6 items-center">
                <div className="md:col-span-4 flex flex-col items-center p-4 bg-[#0a0d14] border border-slate-800 rounded-xl">
                  <CyberQRCode 
                    value={activeBooking.qrCodeData} 
                    size={130} 
                    downloadFilename={`cybercraze-checkin-${activeBooking.id.toLowerCase()}`}
                    showDownloadButton={true}
                  />
                  <span className="text-[11px] text-slate-400 mt-2 font-medium">
                    Show QR at Desk
                  </span>
                </div>

                <div className="md:col-span-8 space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-4 p-4 bg-slate-900/60 rounded-xl border border-slate-800">
                    <div>
                      <div className="text-slate-400 text-[11px]">Station / Setup</div>
                      <div className="font-mono font-bold text-white text-base mt-0.5">
                        {activeBooking.deviceCode}
                      </div>
                      <div className="text-slate-300 text-xs">{activeBooking.deviceName}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[11px]">Category</div>
                      <div className="font-semibold text-blue-400 text-sm mt-0.5">
                        {activeBooking.categoryName}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 p-4 bg-slate-900/60 rounded-xl border border-slate-800">
                    <div>
                      <div className="text-slate-400 text-[11px]">Date & Time</div>
                      <div className="font-bold text-white text-xs mt-0.5">
                        {activeBooking.date}
                      </div>
                      <div className="text-blue-400 font-medium">
                        {activeBooking.startTime} – {activeBooking.endTime} ({activeBooking.durationMinutes} mins)
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[11px]">Customer</div>
                      <div className="font-semibold text-white text-xs mt-0.5">
                        {activeBooking.customerName}
                      </div>
                      <div className="text-slate-300">{activeBooking.customerPhone}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Session Fee</span>
                  <span className="font-bold text-white tabular-nums">৳{activeBooking.totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Status</span>
                  <span className="font-medium text-emerald-400">{activeBooking.paymentStatus}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800">
                  <span className="text-slate-400">Due at Front Desk</span>
                  <span className="font-bold text-white tabular-nums">৳{activeBooking.remainingAmount}</span>
                </div>
              </div>

              {/* Action Buttons for Rescheduling and Cancellation */}
              {activeBooking.status === 'CONFIRMED' && (
                <div className="pt-6 border-t border-slate-800 flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      setNewDate(activeBooking.date);
                      setNewTime(activeBooking.startTime);
                      setIsRescheduling(true);
                    }}
                    className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-blue-400 border border-slate-700 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reschedule Session</span>
                  </button>

                  <button
                    onClick={() => setIsCancelling(true)}
                    className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-rose-950/30 text-rose-400 border border-slate-800 hover:border-rose-800/40 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancel Reservation</span>
                  </button>
                </div>
              )}
            </div>

            {/* Other Bookings for this customer */}
            {associatedBookings.length > 0 && (
              <div className="bg-[#101624] border border-slate-800 rounded-2xl p-5 space-y-3 shadow-card">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
                  Other Bookings for {activeBooking.customerPhone}
                </h3>
                <div className="divide-y divide-slate-800/80">
                  {associatedBookings.map((b) => (
                    <div key={b.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono text-blue-400 font-bold">{b.id}</span>
                        <span className="text-slate-300 ml-2">· {b.deviceName} ({b.date} {b.startTime})</span>
                      </div>
                      <button
                        onClick={() => setActiveBooking(b)}
                        className="text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
                      >
                        View Pass →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* RESCHEDULE MODAL */}
        {isRescheduling && activeBooking && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#101624] border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-card space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="font-bold text-base text-white">
                  Reschedule Session
                </h3>
                <button onClick={() => setIsRescheduling(false)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Choose a new date and start time for {activeBooking.deviceName}.
              </p>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">New Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">New Start Time</label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg text-xs text-white"
                />
              </div>

              {rescheduleError && (
                <div className="p-2.5 bg-rose-950/40 border border-rose-800/60 rounded-lg text-rose-300 text-xs">
                  {rescheduleError}
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsRescheduling(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteReschedule}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-subtle"
                >
                  Confirm New Slot
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CANCEL MODAL */}
        {isCancelling && activeBooking && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#101624] border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-card space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="font-bold text-base text-white">
                  Cancel Reservation?
                </h3>
                <button onClick={() => setIsCancelling(false)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Are you sure you want to cancel booking <strong className="font-mono text-white">{activeBooking.id}</strong>? The station will be released for other players immediately.
              </p>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Reason for Cancellation (Optional)</label>
                <input
                  type="text"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Change of plans"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg text-xs text-white"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCancelling(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Keep Booking
                </button>
                <button
                  type="button"
                  onClick={handleExecuteCancel}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-subtle"
                >
                  Cancel Booking
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
