import React, { useState, useEffect } from 'react';
import { cyberStore } from '../lib/cyberStore';
import { Device, DeviceCategory } from '../types';
import { 
  Gamepad2,
  ChevronRight, 
  X,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Tv
} from 'lucide-react';

interface Props {
  navigate: (path: string) => void;
}

export const DevicesPage: React.FC<Props> = ({ navigate }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDeviceModal, setSelectedDeviceModal] = useState<Device | null>(null);

  useEffect(() => {
    const sync = () => {
      setDevices(cyberStore.getDevices());
    };
    sync();
    return cyberStore.subscribe(sync);
  }, []);

  // Filter for active devices (currently the 2 PS5s)
  const activeDevices = devices.filter(d => d.active);
  const inactiveDevices = devices.filter(d => !d.active);

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
              Fleet Inventory & Hardware
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              Active Battlestations
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Equipped with Sony PlayStation 5 consoles, 65" 4K 120Hz OLED displays, and unlimited access to all games free.
            </p>
          </div>

          <button
            onClick={() => navigate('/book')}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-subtle transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <span>Book 1-Hour Slot</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Free Game Library Notice */}
        <div className="p-4 sm:p-5 bg-blue-950/30 border border-blue-800/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Gamepad2 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">
                All Games Included Free – Play Any Game During Your Time!
              </div>
              <div className="text-xs text-slate-300 mt-0.5">
                Every booking comes with full access to our complete PlayStation library (FC 25, Tekken 8, Spider-Man 2, GTA V, Mortal Kombat 1, God of War Ragnarök, NBA 2K25, etc.). Switch games anytime!
              </div>
            </div>
          </div>
          <div className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-800/40 shrink-0 self-start sm:self-auto">
            Discrete 1-Hour Sessions
          </div>
        </div>

        {/* Active Devices Grid (The 2 PS5s) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-white">Active PlayStation 5 Lounges</h3>
            <span className="text-xs text-slate-400 font-medium">
              {activeDevices.length} Stations in Service
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeDevices.map((device) => {
              const isAvailable = device.status === 'AVAILABLE';
              return (
                <div
                  key={device.id}
                  className="bg-[#101624] border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden flex flex-col justify-between group transition-all duration-200 shadow-card hover:shadow-card-hover"
                >
                  <div>
                    {/* Image container */}
                    <div className="relative h-56 bg-slate-950 overflow-hidden border-b border-slate-800/80">
                      <img
                        src={device.image}
                        alt={device.name}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#101624] via-transparent to-transparent opacity-80" />
                      
                      {/* Station Code Badge */}
                      <div className="absolute top-3 left-3 bg-[#0a0d14]/90 backdrop-blur-md border border-slate-700/80 px-2.5 py-1 rounded-md text-xs font-mono font-bold text-blue-400">
                        {device.code}
                      </div>

                      {/* Status Indicator */}
                      <div className="absolute top-3 right-3">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1.5 backdrop-blur-md ${
                          isAvailable
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                            : 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                          {isAvailable ? 'Ready for Booking' : 'In Session'}
                        </span>
                      </div>

                      {/* Display Tag */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-300">
                        <span className="bg-black/60 px-2.5 py-1 rounded-md backdrop-blur-sm border border-white/10 font-medium">
                          {device.display}
                        </span>
                        <span className="bg-black/60 px-2.5 py-1 rounded-md backdrop-blur-sm border border-white/10 font-medium text-emerald-300">
                          All Games Included Free
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 space-y-4">
                      <div>
                        <div className="text-[11px] font-medium text-blue-400 uppercase tracking-wider">
                          {device.zone}
                        </div>
                        <h3 className="text-xl font-bold text-white mt-0.5">
                          {device.name}
                        </h3>
                        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                          {device.description}
                        </p>
                      </div>

                      {/* Specs List */}
                      <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800/80 text-xs space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Console:</span>
                          <span className="text-white font-medium">PlayStation 5 (1TB Ultra-Fast SSD)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Screen:</span>
                          <span className="text-white font-medium">{device.display}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Controllers:</span>
                          <span className="text-white font-medium">2x DualSense Wireless (up to 4 supported)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Game Selection:</span>
                          <span className="text-emerald-400 font-medium">Unrestricted Free Game Switching</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 py-4 bg-slate-900/40 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">1-Hour Session</div>
                      <div className="text-xl font-extrabold text-white tabular-nums">
                        ৳{device.hourlyPrice} <span className="text-xs font-normal text-slate-400">/hr</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedDeviceModal(device)}
                        className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                      >
                        View Specs
                      </button>
                      <button
                        onClick={() => navigate(`/book?device=${device.id}`)}
                        className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-subtle cursor-pointer"
                      >
                        <span>Book 1 Hour</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fleet Expansion Notice */}
        <div className="bg-[#101624] border border-slate-800 rounded-2xl p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>Fleet Expansion in Progress</span>
          </div>
          <h3 className="font-bold text-lg text-white">Upcoming Hardware Platforms</h3>
          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
            CyberCraze currently offers two flagship PlayStation 5 stations. Our database is equipped for high-performance PC battlestations (RTX 4080 / 240Hz OLED) and direct-drive racing simulators, which can be deployed and activated dynamically by lounge administration.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
              <div className="font-semibold text-slate-200">RTX 4080 PC Battlestations</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Admin-ready · 240Hz OLED</div>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
              <div className="font-semibold text-slate-200">Fanatec Racing Cockpit</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Admin-ready · Direct Drive</div>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
              <div className="font-semibold text-slate-200">VIP Squad Theater</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Admin-ready · 85" 4K Lounge</div>
            </div>
          </div>
        </div>

      </div>

      {/* DEVICE DETAILS MODAL */}
      {selectedDeviceModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101624] border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="font-mono text-xs font-bold text-blue-400">
                  {selectedDeviceModal.code}
                </span>
                <h3 className="font-bold text-lg text-white">
                  {selectedDeviceModal.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDeviceModal(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedDeviceModal.description}
            </p>

            <div className="space-y-2 text-xs">
              <div className="font-semibold text-white">Technical Specifications</div>
              <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
                {Object.entries(selectedDeviceModal.specifications || {}).map(([key, val]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-slate-400">{key}:</span>
                    <span className="text-white font-medium text-right">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-400">Hourly Rate</div>
                <div className="text-lg font-bold text-white">৳{selectedDeviceModal.hourlyPrice} /hr</div>
              </div>
              <button
                onClick={() => {
                  setSelectedDeviceModal(null);
                  navigate(`/book?device=${selectedDeviceModal.id}`);
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-subtle transition-colors cursor-pointer"
              >
                Book 1-Hour Slot →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
