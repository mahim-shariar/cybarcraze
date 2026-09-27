import React, { useState, useEffect } from 'react';
import { cyberStore } from '../../lib/cyberStore';
import { ActiveSession } from '../../types';
import { Timer, Clock, Plus, Square, CheckCircle2, User, AlertTriangle, Bell, ShieldAlert, RotateCcw } from 'lucide-react';

export const AdminSessions: React.FC = () => {
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [now, setNow] = useState(Date.now());
  const [actionMsg, setActionMsg] = useState('');

  // 1-second interval for real-time countdown
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const sync = () => {
      setSessions(cyberStore.getSessions().filter(s => s.status === 'ACTIVE'));
    };
    sync();
    return cyberStore.subscribe(sync);
  }, []);

  const getRemainingInfo = (endStr: string) => {
    const diff = new Date(endStr).getTime() - now;
    if (diff <= 0) {
      return {
        isExpired: true,
        text: '00:00:00 (TIME OVER)'
      };
    }

    const totalSecs = Math.floor(diff / 1000);
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return {
      isExpired: false,
      text: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    };
  };

  const handleExtend = (id: string, mins: number) => {
    const res = cyberStore.extendSession(id, mins);
    setActionMsg(res.message);
    setTimeout(() => setActionMsg(''), 3000);
  };

  const handleEndAndVacate = async (session: ActiveSession) => {
    const res = cyberStore.endSession(session.id);
    // Also notify backend
    await fetch('/api/sessions/finish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: session.id, deviceId: session.deviceId })
    }).catch(console.error);

    setActionMsg(`Station ${session.deviceCode} vacated & sanitized. Status set to AVAILABLE.`);
    setTimeout(() => setActionMsg(''), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
            Live Station Countdown Timers
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Active Match Sessions ({sessions.length})
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time countdown clocks. When a player's time finishes, the station signals an immediate vacate alert.
          </p>
        </div>

        {actionMsg && (
          <div className="p-2.5 px-4 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{actionMsg}</span>
          </div>
        )}
      </div>

      {sessions.length === 0 ? (
        <div className="bg-[#101624] border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs">
          No live match sessions running right now. Scan a booking or VIP QR pass in the check-in modal to launch a live session.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sessions.map((sess) => {
            const rem = getRemainingInfo(sess.scheduledEnd);

            return (
              <div
                key={sess.id}
                className={`bg-[#101624] border rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 shadow-card ${
                  rem.isExpired
                    ? 'border-rose-500 bg-rose-950/20 shadow-[0_0_24px_rgba(244,63,94,0.3)] animate-pulse'
                    : 'border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="font-mono font-bold text-lg text-white">
                      {sess.deviceCode}
                    </span>
                    {rem.isExpired ? (
                      <span className="text-xs uppercase font-extrabold text-rose-400 flex items-center gap-1.5 bg-rose-950/80 px-2.5 py-1 rounded-full border border-rose-500">
                        <AlertTriangle className="w-4 h-4 animate-bounce" />
                        TIME OVER — VACATE STATION
                      </span>
                    ) : (
                      <span className="text-xs uppercase font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/40">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        MATCH IN PROGRESS
                      </span>
                    )}
                  </div>

                  {/* Countdown Timer Display */}
                  <div className={`my-5 p-5 rounded-xl border text-center space-y-1 ${
                    rem.isExpired
                      ? 'bg-rose-950/60 border-rose-500 text-white'
                      : 'bg-[#0a0d14] border-slate-800 text-white'
                  }`}>
                    <div className="text-[11px] uppercase tracking-wider text-slate-400">
                      {rem.isExpired ? 'Status' : 'Time Remaining (Ticks Down Live)'}
                    </div>
                    <div className={`font-mono font-extrabold text-3xl sm:text-4xl tracking-wider tabular-nums ${
                      rem.isExpired ? 'text-rose-400' : 'text-blue-400'
                    }`}>
                      {rem.text}
                    </div>
                    {rem.isExpired && (
                      <div className="text-xs text-rose-300 font-bold pt-1">
                        ⚠️ 1-Hour slot has ended! Ask player to conclude match and vacate station.
                      </div>
                    )}
                  </div>

                  {/* Player & Session Details */}
                  <div className="space-y-2 text-xs text-slate-300 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Player:</span>
                      <span className="font-bold text-white">{sess.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Mobile Phone:</span>
                      <span className="text-slate-300">{sess.customerPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Session Window:</span>
                      <span className="text-blue-400 font-mono font-medium">{sess.startTime} – {sess.endTime} ({sess.durationMinutes}m)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Station Hardware:</span>
                      <span className="text-slate-200">PlayStation 5 (65" 4K OLED)</span>
                    </div>
                  </div>
                </div>

                {/* Counter Actions */}
                <div className="pt-5 border-t border-slate-800 flex items-center justify-between gap-3 mt-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleExtend(sess.id, 60)}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+1 Hour</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleEndAndVacate(sess)}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-md ${
                      rem.isExpired
                        ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                        : 'bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white'
                    }`}
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>{rem.isExpired ? 'Player Vacated & Cleared' : 'End Match'}</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
