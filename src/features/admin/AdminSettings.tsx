import React, { useState, useEffect } from 'react';
import { cyberStore } from '../../lib/cyberStore';
import { CafeSettings } from '../../types';
import { Settings, Save, CheckCircle2, Shield } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<CafeSettings>(cyberStore.getSettings());
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    const sync = () => setSettings(cyberStore.getSettings());
    sync();
    return cyberStore.subscribe(sync);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    cyberStore.updateSettings(settings);
    setSavedMsg('Settings saved successfully!');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="text-xs font-chakra tracking-widest text-cyan-400 uppercase">
            Global Configuration
          </div>
          <h1 className="font-orbitron font-extrabold text-2xl sm:text-3xl text-white mt-1">
            CAFE SETTINGS & POLICIES
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Configure business identity, location coordinates, currency, deposit percentages, and guest cancellation rules.
          </p>
        </div>

        {savedMsg && (
          <div className="p-2.5 px-4 bg-emerald-950/60 border border-emerald-500/40 rounded text-emerald-300 text-xs font-chakra flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{savedMsg}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs font-chakra">
        {/* BRAND & CONTACT */}
        <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-6 space-y-4 shadow-sm">
          <h3 className="font-orbitron font-bold text-sm text-white uppercase border-b border-slate-800 pb-2">
            Business & Headquarters Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 uppercase mb-1">Business Name</label>
              <input
                type="text"
                value={settings.businessName}
                onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 uppercase mb-1">Brand Tagline</label>
              <input
                type="text"
                value={settings.brandTagline}
                onChange={(e) => setSettings({ ...settings, brandTagline: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 uppercase mb-1">Full Physical Address</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 uppercase mb-1">Location Short</label>
              <input
                type="text"
                value={settings.locationShort}
                onChange={(e) => setSettings({ ...settings, locationShort: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 uppercase mb-1">Phone Number</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 uppercase mb-1">WhatsApp Frontdesk</label>
              <input
                type="text"
                value={settings.whatsapp}
                onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 uppercase mb-1">Contact Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* BOOKING & DEPOSIT POLICIES */}
        <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-6 space-y-4 shadow-sm">
          <h3 className="font-orbitron font-bold text-sm text-white uppercase border-b border-slate-800 pb-2">
            Booking & Deposit Governance
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 uppercase mb-1">Deposit Type</label>
              <select
                value={settings.depositType}
                onChange={(e) => setSettings({ ...settings, depositType: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white"
              >
                <option value="NONE">No Advance Deposit (Pay at Counter)</option>
                <option value="FIXED">Fixed Deposit Amount (৳)</option>
                <option value="PERCENTAGE">Percentage Deposit (%)</option>
                <option value="FULL">Full Payment Required</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 uppercase mb-1">Deposit Amount / Value</label>
              <input
                type="number"
                value={settings.depositValue}
                onChange={(e) => setSettings({ ...settings, depositValue: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white font-orbitron"
              />
            </div>

            <div>
              <label className="block text-slate-400 uppercase mb-1">Advance Booking Window (Days)</label>
              <input
                type="number"
                value={settings.advanceBookingDays}
                onChange={(e) => setSettings({ ...settings, advanceBookingDays: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white font-orbitron"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 uppercase mb-1">Cancellation Notice (Hours)</label>
              <input
                type="number"
                value={settings.cancellationNoticeHours}
                onChange={(e) => setSettings({ ...settings, cancellationNoticeHours: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white font-orbitron"
              />
            </div>

            <div>
              <label className="block text-slate-400 uppercase mb-1">Currency Code</label>
              <input
                type="text"
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white font-orbitron uppercase"
              />
            </div>

            <div>
              <label className="block text-slate-400 uppercase mb-1">Timezone</label>
              <input
                type="text"
                disabled
                value={settings.timezone}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-pink-500 text-slate-950 font-orbitron font-bold text-xs tracking-wider rounded shadow-neon-cyan flex items-center gap-2 cursor-pointer transition-all"
          >
            <Save className="w-4 h-4" />
            <span>SAVE CONFIGURATION</span>
          </button>
        </div>
      </form>
    </div>
  );
};
