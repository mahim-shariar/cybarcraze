import React, { useState, useEffect } from 'react';
import { cyberStore } from '../../lib/cyberStore';
import { ActivityLog } from '../../types';
import { History, Shield, Clock } from 'lucide-react';

export const AdminActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    const sync = () => setLogs(cyberStore.getActivityLogs());
    sync();
    return cyberStore.subscribe(sync);
  }, []);

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-800">
        <div className="text-xs font-chakra tracking-widest text-cyan-400 uppercase">
          Security & Audit Trail
        </div>
        <h1 className="font-orbitron font-extrabold text-2xl sm:text-3xl text-white mt-1">
          OPERATIONAL ACTIVITY LOGS
        </h1>
        <p className="text-xs text-slate-400 font-sans mt-0.5">
          Immutable audit record of all price adjustments, customer check-ins, walk-ins, cancellations, and device updates.
        </p>
      </div>

      <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        {logs.map((log) => (
          <div key={log.id} className="py-2.5 border-b border-slate-800/60 last:border-none flex items-start justify-between text-xs font-chakra gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-cyan-400">{log.actor}</span>
                <span className="text-[10px] text-slate-500 uppercase">[{log.role}]</span>
                <span className="text-slate-600">·</span>
                <span className="font-orbitron font-bold text-white text-[11px]">{log.action}</span>
                <span className="text-pink-400 font-medium">({log.target})</span>
              </div>
              <p className="text-slate-300 font-sans text-[11px]">{log.details}</p>
            </div>
            <div className="text-[10px] text-slate-500 whitespace-nowrap">
              {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
