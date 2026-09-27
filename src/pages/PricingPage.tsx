import React from 'react';
import { cyberStore } from '../lib/cyberStore';
import { Check, ChevronRight, Gamepad2, Sparkles, ShieldCheck } from 'lucide-react';

interface Props {
  navigate: (path: string) => void;
}

export const PricingPage: React.FC<Props> = ({ navigate }) => {
  // Only active devices (currently 2 PS5s)
  const devices = cyberStore.getDevices().filter(d => d.active);

  const passes = [
    {
      name: 'Standard 1-Hour Match Pass',
      category: 'PlayStation 5',
      regularPrice: 150,
      bundlePrice: 120,
      savings: 'Regular Hours',
      features: [
        '1 Full 60-Minute Game Session (e.g. 10:00–11:00, 14:00–15:00)',
        'Full access to ALL games (FC 25, Tekken 8, Spider-Man 2, GTA V)',
        'Free to switch and play ANY game during your hour',
        '2x DualSense wireless controllers included for co-op or 1v1',
        '65" 4K 120Hz OLED Display + 3D Surround Audio'
      ]
    },
    {
      name: '2-Hour Co-op Squad Pass',
      category: 'PlayStation 5',
      regularPrice: 240,
      bundlePrice: 220,
      savings: 'Save ৳20',
      features: [
        '2 Hours of uninterrupted gameplay on flagship PS5 station',
        'Switch titles anytime (FC 25, WWE 2K24, Mortal Kombat 1)',
        'Up to 4 players supported with DualSense controllers',
        '65" OLED 120Hz display with zero input latency',
        'Instant digital pass reservation (no login required)'
      ]
    },
    {
      name: '3-Hour Gaming Marathon Pass',
      category: 'PlayStation 5',
      regularPrice: 360,
      bundlePrice: 320,
      savings: 'Save ৳40',
      features: [
        '3 Hours dedicated lounge booth for campaign grind or tournament',
        'Play through single-player blockbusters (God of War, Spider-Man 2)',
        'Unlimited game switching with 50+ PS Plus Deluxe titles',
        'Premium ultra-comfortable lounge sofa and soundproofing',
        'Guaranteed station reservation with priority check-in'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
            Simple 1-Hour Hourly Rates
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
            Pricing & Match Passes
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Discrete 1-hour sessions (10:00–11:00, 14:00–15:00, etc.). All installed games are included 100% free with unlimited switching anytime!
          </p>
        </div>

        {/* Free Game Library Included Banner */}
        <div className="p-4 sm:p-5 bg-blue-950/30 border border-blue-800/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Gamepad2 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">
                No Game Selection Needed – Play Any Game During Your Hour!
              </div>
              <div className="text-xs text-slate-300 mt-0.5">
                Every reservation includes full access to our entire PS5 library (FC 25, Tekken 8, Spider-Man 2, GTA V, Mortal Kombat 1, God of War Ragnarök, NBA 2K25, etc.). Switch games whenever you want!
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/book')}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-subtle transition-all shrink-0 cursor-pointer self-start sm:self-auto"
          >
            Book 1-Hour Slot →
          </button>
        </div>

        {/* Standard Hourly Breakdown Table */}
        <div className="bg-[#101624] border border-slate-800 rounded-2xl p-6 shadow-card overflow-x-auto">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-base text-white">Active PlayStation 5 Stations</h3>
              <p className="text-xs text-slate-400 mt-0.5">Currently 2 flagship PS5 stations in active service.</p>
            </div>
            <span className="text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1 rounded-full self-start sm:self-auto">
              Discrete 1-Hour Slots
            </span>
          </div>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                <th className="pb-3 font-semibold">Station</th>
                <th className="pb-3 font-semibold">Hardware Setup</th>
                <th className="pb-3 font-semibold">Display & Audio</th>
                <th className="pb-3 font-semibold">Standard 1-Hr Rate</th>
                <th className="pb-3 font-semibold">Peak (6–10 PM)</th>
                <th className="pb-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {devices.map((d) => (
                <tr key={d.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3.5 font-mono font-bold text-blue-400">{d.code}</td>
                  <td className="py-3.5">
                    <div className="text-white font-medium">{d.name}</div>
                    <div className="text-[11px] text-slate-400">{d.zone} · 2 DualSense included</div>
                  </td>
                  <td className="py-3.5 text-slate-300 max-w-xs">{d.display}</td>
                  <td className="py-3.5 font-bold text-white tabular-nums">৳{d.hourlyPrice}/hr</td>
                  <td className="py-3.5 text-slate-300 tabular-nums">
                    ৳{d.peakHourPrice || d.hourlyPrice}/hr
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => navigate(`/book?device=${d.id}`)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Book 1 Hour
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Multi-Hour Discount Packages */}
        <div>
          <div className="mb-6">
            <h3 className="font-bold text-xl text-white">Multi-Hour Match Passes</h3>
            <p className="text-xs text-slate-400 mt-1">Book 2 or 3 continuous hours and enjoy automatic discounted rates.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {passes.map((pass) => (
              <div
                key={pass.name}
                className="bg-[#101624] border border-slate-800 hover:border-slate-700 rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 shadow-card hover:shadow-card-hover"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-slate-400 font-medium">{pass.category}</span>
                    <span className="text-emerald-400 font-semibold">{pass.savings}</span>
                  </div>
                  <h4 className="font-bold text-base text-white mb-3">{pass.name}</h4>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="font-extrabold text-2xl text-blue-400 tabular-nums">৳{pass.bundlePrice}</span>
                    <span className="text-xs text-slate-500 line-through tabular-nums">৳{pass.regularPrice}</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300 mb-6">
                    {pass.features.map(f => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => navigate('/book')}
                  className="w-full py-2.5 bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-200 border border-slate-700 rounded-lg font-medium text-xs transition-colors cursor-pointer"
                >
                  Book This Pass
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Fleet Expansion Notice */}
        <div className="bg-[#101624] border border-slate-800 rounded-2xl p-6 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Fleet Expansion in Progress</span>
            </div>
            <h4 className="font-bold text-base text-white mt-1">Expanding Hardware Fleet</h4>
            <p className="text-xs text-slate-400 mt-0.5 max-w-2xl leading-relaxed">
              CyberCraze is currently running two premier PlayStation 5 4K OLED lounges. Additional battlestations (RTX 4080 Gaming PCs, Direct-Drive Simulators, VR Arena) are already wired into our operational database and can be activated dynamically by cafe management.
            </p>
          </div>
          <button
            onClick={() => navigate('/devices')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
          >
            Explore Hardware Fleet →
          </button>
        </div>

      </div>
    </div>
  );
};
