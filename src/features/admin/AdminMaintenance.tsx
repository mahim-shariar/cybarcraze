import React, { useState, useEffect } from 'react';
import { cyberStore } from '../../lib/cyberStore';
import { OpeningHourDay, MaintenanceBlock, Device } from '../../types';
import { Clock, Wrench, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export const AdminMaintenance: React.FC = () => {
  const [openingHours, setOpeningHours] = useState<OpeningHourDay[]>([]);
  const [maintenanceBlocks, setMaintenanceBlocks] = useState<MaintenanceBlock[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);

  // Maintenance form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [maintDate, setMaintDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('16:00');
  const [reason, setReason] = useState('');

  useEffect(() => {
    const sync = () => {
      setOpeningHours(cyberStore.getOpeningHours());
      setMaintenanceBlocks(cyberStore.getMaintenanceBlocks());
      setDevices(cyberStore.getDevices());
    };
    sync();
    return cyberStore.subscribe(sync);
  }, []);

  const handleCreateBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeviceId) return;

    const dev = devices.find(d => d.id === selectedDeviceId);

    cyberStore.addMaintenanceBlock({
      deviceId: selectedDeviceId,
      deviceCode: dev?.code,
      date: maintDate,
      startTime,
      endTime,
      reason: reason || 'Scheduled hardware tuning and sensor calibration'
    });

    setIsModalOpen(false);
    setReason('');
  };

  const handleDeleteBlock = (id: string) => {
    cyberStore.deleteMaintenanceBlock(id);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="text-xs font-chakra tracking-widest text-cyan-400 uppercase">
            Facility Scheduling
          </div>
          <h1 className="font-orbitron font-extrabold text-2xl sm:text-3xl text-white mt-1">
            OPENING HOURS & MAINTENANCE
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Set weekly cafe opening hours and schedule device maintenance blocks (which automatically prevents customer booking conflicts).
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-orbitron font-bold text-xs rounded shadow-md flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>SCHEDULE MAINTENANCE</span>
        </button>
      </div>

      {/* WEEKLY OPENING HOURS */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="font-orbitron font-bold text-sm text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          WEEKLY OPERATING HOURS (ASIA/DHAKA TIMEZONE)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {openingHours.map((d) => (
            <div key={d.day} className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-chakra text-center space-y-1">
              <div className="font-bold text-white uppercase text-[11px]">{d.day}</div>
              <div className="text-cyan-400 font-medium">{d.open} – {d.close}</div>
              <span className="text-[10px] text-emerald-400 block font-semibold">● OPEN</span>
            </div>
          ))}
        </div>
      </div>

      {/* SCHEDULED MAINTENANCE BLOCKS */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="font-orbitron font-bold text-sm text-white flex items-center gap-2">
          <Wrench className="w-4 h-4 text-amber-400" />
          ACTIVE MAINTENANCE BLOCKS
        </h3>

        {maintenanceBlocks.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs font-chakra">
            No stations scheduled for maintenance. All stations are eligible for booking.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {maintenanceBlocks.map((block) => (
              <div key={block.id} className="py-3 flex items-center justify-between text-xs font-chakra">
                <div>
                  <span className="font-orbitron font-bold text-amber-400">{block.deviceCode || 'Device'}</span>
                  <span className="text-white ml-2">· {block.date} ({block.startTime}–{block.endTime})</span>
                  <div className="text-slate-400 text-[11px] mt-0.5">{block.reason}</div>
                </div>
                <button
                  onClick={() => handleDeleteBlock(block.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400"
                  title="Remove maintenance block"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SCHEDULE MAINTENANCE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-amber-500/40 rounded-xl p-6 max-w-md w-full shadow-lg space-y-4">
            <h3 className="font-orbitron font-extrabold text-lg text-white">SCHEDULE MAINTENANCE</h3>
            <form onSubmit={handleCreateBlock} className="space-y-3 text-xs font-chakra">
              <div>
                <label className="block text-slate-400 uppercase mb-1">Target Station *</label>
                <select
                  required
                  value={selectedDeviceId}
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                >
                  <option value="">-- Choose Device --</option>
                  {devices.map((d) => (
                    <option key={d.id} value={d.id}>{d.code} · {d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 uppercase mb-1">Date</label>
                <input
                  type="date"
                  value={maintDate}
                  onChange={(e) => setMaintDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 uppercase mb-1">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase mb-1">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 uppercase mb-1">Maintenance Reason</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. GPU thermal paste replacement & display calibration"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 bg-slate-900 text-slate-400 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-orbitron font-bold rounded"
                >
                  Block Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
