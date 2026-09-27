import React, { useState, useEffect } from 'react';
import { cyberStore } from '../../lib/cyberStore';
import { Customer } from '../../types';
import { Users, Search, Phone, ShieldCheck, DollarSign } from 'lucide-react';

export const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const sync = () => setCustomers(cyberStore.getCustomers());
    sync();
    return cyberStore.subscribe(sync);
  }, []);

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="text-xs font-chakra tracking-widest text-cyan-400 uppercase">
            Guest CRM & Player Histories
          </div>
          <h1 className="font-orbitron font-extrabold text-2xl sm:text-3xl text-white mt-1">
            CUSTOMER DIRECTORY
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Automatic tracking of regular players by phone number without requiring password signups.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name or phone number..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded text-xs text-white placeholder-slate-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-chakra">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Mobile Number</th>
                <th className="py-3 px-4">Total Sessions</th>
                <th className="py-3 px-4">Total Spending</th>
                <th className="py-3 px-4">Last Visit</th>
                <th className="py-3 px-4">VIP Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4">
                    <span className="text-white font-medium block">{c.name}</span>
                    {c.notes && <span className="text-[11px] text-slate-500">{c.notes}</span>}
                  </td>
                  <td className="py-3 px-4 font-orbitron text-cyan-400 font-bold">
                    {c.phone}
                  </td>
                  <td className="py-3 px-4 text-slate-200">
                    {c.totalBookings} visits
                  </td>
                  <td className="py-3 px-4 font-orbitron font-bold text-white">
                    ৳{c.totalSpent.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {c.lastVisit || 'Today'}
                  </td>
                  <td className="py-3 px-4">
                    {c.isMember ? (
                      <span className="text-pink-400 font-bold uppercase text-[10px] bg-pink-950/60 border border-pink-500/40 px-2 py-0.5 rounded">
                        {c.membershipTier || 'VIP Member'}
                      </span>
                    ) : (
                      <span className="text-slate-500 uppercase text-[10px]">Guest</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
