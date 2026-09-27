import React, { useState, useEffect, useMemo } from 'react';
import { cyberStore } from '../../lib/cyberStore';
import { Device, Customer } from '../../types';
import { User, Phone, CheckCircle2, AlertCircle, Play, UserCheck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminWalkInModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [phoneInput, setPhoneInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'BKASH' | 'NAGAD' | 'CARD'>('CASH');
  const [startImmediately, setStartImmediately] = useState(true);

  const [existingCustomer, setExistingCustomer] = useState<Customer | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setDevices(cyberStore.getDevices().filter(d => d.status === 'AVAILABLE' && d.active));
      setCustomers(cyberStore.getCustomers());
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen]);

  // Lookup existing customer on phone input change
  const handlePhoneChange = (val: string) => {
    setPhoneInput(val);
    const clean = val.trim();
    if (clean.length >= 8) {
      const match = customers.find(c => c.phone === clean || c.phone.replace(/[\s-]/g, '') === clean.replace(/[\s-]/g, ''));
      if (match) {
        setExistingCustomer(match);
        setNameInput(match.name);
      } else {
        setExistingCustomer(null);
      }
    } else {
      setExistingCustomer(null);
    }
  };

  const selectedDevice = devices.find(d => d.id === selectedDeviceId);

  // Quote
  const quote = useMemo(() => {
    if (!selectedDeviceId) return 0;
    const dev = cyberStore.getDeviceById(selectedDeviceId);
    if (!dev) return 0;
    return Math.round((dev.hourlyPrice * durationMinutes) / 60);
  }, [selectedDeviceId, durationMinutes]);

  const handleCreateWalkIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!phoneInput.trim() || !nameInput.trim()) {
      setErrorMsg('Customer name and phone number are required.');
      return;
    }

    if (!selectedDeviceId) {
      setErrorMsg('Please select an available battle station.');
      return;
    }

    try {
      const nowTime = new Date().toTimeString().slice(0, 5); // HH:mm
      const todayStr = new Date().toISOString().split('T')[0];

      const booking = cyberStore.createBooking({
        deviceId: selectedDeviceId,
        date: todayStr,
        startTime: nowTime,
        durationMinutes,
        customerName: nameInput.trim(),
        customerPhone: phoneInput.trim(),
        paymentMethod,
        isWalkIn: true,
        markCheckedIn: startImmediately
      });

      setSuccessMsg(`Walk-in registered successfully! Booking: ${booking.id}`);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to register walk-in session');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0b0f19] border border-cyan-500/40 rounded-xl p-6 max-w-lg w-full shadow-neon-cyan space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <span className="text-[11px] font-chakra uppercase text-cyan-400 font-bold">Front Counter</span>
            <h3 className="font-orbitron font-extrabold text-xl text-white">NEW WALK-IN SESSION</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs font-chakra"
          >
            ✕ Close
          </button>
        </div>

        {errorMsg && (
          <div className="p-2.5 bg-rose-950/40 border border-rose-500/40 rounded text-rose-300 text-xs font-chakra flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/40 rounded text-emerald-300 text-xs font-chakra flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleCreateWalkIn} className="space-y-4 text-xs font-chakra">
          {/* Phone Number Lookup */}
          <div>
            <label className="block uppercase text-slate-400 mb-1">
              Customer Mobile Phone *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="tel"
                required
                value={phoneInput}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="e.g. 01712345678"
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded text-xs text-white"
              />
            </div>
          </div>

          {/* Returning Customer Recognition Badge */}
          {existingCustomer && (
            <div className="p-3 bg-cyan-950/30 border border-cyan-500/40 rounded-lg space-y-1">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-xs">
                <UserCheck className="w-4 h-4" />
                <span>Existing Customer Recognized</span>
              </div>
              <div className="text-slate-300 flex justify-between text-[11px]">
                <span>Total Bookings: {existingCustomer.totalBookings}</span>
                <span>Total Spent: ৳{existingCustomer.totalSpent}</span>
                <span>Last Visit: {existingCustomer.lastVisit || 'Recent'}</span>
              </div>
            </div>
          )}

          {/* Customer Name */}
          <div>
            <label className="block uppercase text-slate-400 mb-1">
              Customer Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. Tanvir Ahmed"
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded text-xs text-white"
              />
            </div>
          </div>

          {/* Available Station Selection */}
          <div>
            <label className="block uppercase text-slate-400 mb-1">
              Select Free Station * ({devices.length} Available)
            </label>
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded text-xs text-white"
            >
              <option value="">-- Choose Available Station --</option>
              {devices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code} · {d.name} (৳{d.hourlyPrice}/h)
                </option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="block uppercase text-slate-400 mb-1">
              Duration (1-Hour Multiples)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { mins: 60, label: '1 Hour' },
                { mins: 120, label: '2 Hours' },
                { mins: 180, label: '3 Hours' },
                { mins: 240, label: '4 Hours' }
              ].map(({ mins, label }) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDurationMinutes(mins)}
                  className={`py-2 text-center rounded-lg border text-xs transition-all cursor-pointer ${
                    durationMinutes === mins
                      ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method & Total Calculation */}
          <div className="p-3 bg-slate-950 rounded border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-slate-400 text-[11px] uppercase">Amount Due</div>
              <div className="font-orbitron font-extrabold text-lg text-cyan-400">৳{quote}</div>
            </div>

            <div className="flex gap-2">
              {(['CASH', 'BKASH', 'NAGAD'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPaymentMethod(m)}
                  className={`px-2.5 py-1 text-[11px] rounded border ${
                    paymentMethod === m
                      ? 'bg-pink-950 border-pink-500 text-pink-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Instant session check */}
          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={startImmediately}
              onChange={(e) => setStartImmediately(e.target.checked)}
              className="accent-cyan-500 rounded"
            />
            <span className="text-slate-300 text-xs">
              Start Session Immediately (Mark Station Occupied)
            </span>
          </label>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-900 text-slate-300 rounded font-chakra text-xs hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-pink-500 text-slate-950 font-orbitron font-bold text-xs rounded shadow-neon-cyan flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              <span>START WALK-IN</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
