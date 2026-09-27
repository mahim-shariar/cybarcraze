import React, { useState, useEffect, useMemo } from 'react';
import { cyberStore } from '../../lib/cyberStore';
import { Device, Booking } from '../../types';
import { CalendarDays, ChevronLeft, ChevronRight, Clock, User } from 'lucide-react';

export const AdminCalendar: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [activeSlotModal, setActiveSlotModal] = useState<Booking | null>(null);

  useEffect(() => {
    const sync = () => {
      setDevices(cyberStore.getDevices());
      setBookings(cyberStore.getBookings());
    };
    sync();
    return cyberStore.subscribe(sync);
  }, []);

  // Time header slots (from 10 AM to 11 PM, hourly chunks)
  const hours = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

  const shiftDay = (delta: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const dayBookings = useMemo(() => {
    return bookings.filter(b => b.date === selectedDate && b.status !== 'CANCELLED');
  }, [bookings, selectedDate]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="text-xs font-chakra tracking-widest text-cyan-400 uppercase">
            Visual Grid Dispatcher
          </div>
          <h1 className="font-orbitron font-extrabold text-2xl sm:text-3xl text-white mt-1">
            STATIONS TIMELINE CALENDAR
          </h1>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-[#0b0f19] border border-slate-800 rounded-lg p-1">
          <button
            onClick={() => shiftDay(-1)}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-900"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-orbitron font-bold text-xs text-cyan-400 px-3">
            {selectedDate}
          </span>
          <button
            onClick={() => shiftDay(1)}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-900"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Visual Timeline Grid */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 overflow-x-auto shadow-sm">
        <div className="min-w-[900px]">
          {/* Header row with hours */}
          <div className="grid grid-cols-14 gap-1 pb-3 border-b border-slate-800 text-xs font-chakra text-slate-400 uppercase text-center">
            <div className="text-left font-bold pl-2 text-white">Rig Code</div>
            {hours.map((h) => (
              <div key={h} className="text-[11px]">
                {h > 12 ? `${h - 12} PM` : h === 12 ? '12 PM' : `${h} AM`}
              </div>
            ))}
          </div>

          {/* Device rows */}
          <div className="divide-y divide-slate-800/60 pt-2 space-y-2">
            {devices.map((device) => {
              const deviceBookings = dayBookings.filter(b => b.deviceId === device.id);

              return (
                <div key={device.id} className="grid grid-cols-14 gap-1 items-center pt-2">
                  {/* Station Label */}
                  <div className="pl-2 font-orbitron font-bold text-xs text-cyan-300">
                    {device.code}
                    <span className="text-[10px] text-slate-500 font-chakra block truncate">{device.zone}</span>
                  </div>

                  {/* Hourly blocks */}
                  {hours.map((h) => {
                    const timeSlot = `${String(h).padStart(2, '0')}:00`;
                    const match = deviceBookings.find((b) => {
                      const bStartHour = Number(b.startTime.split(':')[0]);
                      const bEndHour = Number(b.endTime.split(':')[0]);
                      return h >= bStartHour && h < bEndHour;
                    });

                    if (match) {
                      return (
                        <div
                          key={h}
                          onClick={() => setActiveSlotModal(match)}
                          className="h-9 bg-pink-950/60 border border-pink-500/50 hover:border-pink-400 rounded p-1 text-[10px] font-chakra text-pink-200 cursor-pointer overflow-hidden transition-all shadow-sm"
                          title={`${match.customerName} (${match.startTime} - ${match.endTime})`}
                        >
                          <div className="font-bold truncate">{match.customerName}</div>
                          <div className="text-[9px] text-pink-400 truncate">{match.id}</div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={h}
                        className="h-9 bg-slate-950/60 border border-slate-800/40 rounded flex items-center justify-center text-[10px] font-chakra text-slate-600 hover:border-cyan-500/30 hover:text-cyan-400 transition-colors"
                      >
                        FREE
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pop up slot info */}
      {activeSlotModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-cyan-500/40 rounded-xl p-5 max-w-sm w-full space-y-3 text-xs font-chakra">
            <div className="flex justify-between pb-2 border-b border-slate-800">
              <span className="font-orbitron font-bold text-cyan-400">{activeSlotModal.id}</span>
              <button onClick={() => setActiveSlotModal(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div>
              <span className="text-slate-400">Player: </span>
              <strong className="text-white">{activeSlotModal.customerName}</strong> ({activeSlotModal.customerPhone})
            </div>
            <div>
              <span className="text-slate-400">Station: </span>
              <strong className="text-white">{activeSlotModal.deviceCode}</strong> ({activeSlotModal.deviceName})
            </div>
            <div>
              <span className="text-slate-400">Window: </span>
              <span className="text-white">{activeSlotModal.date} {activeSlotModal.startTime}–{activeSlotModal.endTime}</span>
            </div>
            <div>
              <span className="text-slate-400">Amount: </span>
              <span className="text-cyan-400 font-bold font-orbitron">৳{activeSlotModal.totalAmount}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
