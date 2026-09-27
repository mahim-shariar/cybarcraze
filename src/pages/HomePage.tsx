import React, { useState, useEffect } from 'react';
import { cyberStore } from '../lib/cyberStore';
import { Device, DeviceCategory } from '../types';
import { 
  Gamepad2, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  Tv,
  Zap,
  Users,
  CalendarCheck2,
  Crown
} from 'lucide-react';

interface Props {
  navigate: (path: string) => void;
}

export const HomePage: React.FC<Props> = ({ navigate }) => {
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    const sync = () => {
      setDevices(cyberStore.getDevices());
    };
    sync();
    return cyberStore.subscribe(sync);
  }, []);

  // Filter for active stations (currently the 2 PS5s)
  const activeDevices = devices.filter(d => d.active);
  const availableStationsCount = activeDevices.filter(d => d.status === 'AVAILABLE').length;

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 pb-20 lg:pb-12">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-16 sm:pt-14 sm:pb-24 border-b border-slate-800/80 bg-gradient-to-b from-[#0f1422] to-[#0a0d14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Value Proposition */}
            <div className="lg:col-span-7 space-y-6">
              {/* Quiet unboxed metadata */}
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-400 font-semibold">{availableStationsCount} of {activeDevices.length} PS5 Stations Available</span>
                <span className="text-slate-600">·</span>
                <span>Akua Hazibari, Mymensingh</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
                Next-level PS5 gaming.<br />
                <span className="text-blue-400">Discrete 1-Hour Slots.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
                Experience high-performance PlayStation 5 squad lounges with 65" 4K 120Hz OLEDs. Reserve in 60 seconds with zero passwords needed. Play and switch ANY game in our library free during your hour!
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={() => navigate('/book')}
                  className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-subtle hover:shadow-card-hover transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Book 1-Hour Slot</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    const el = document.getElementById('floor-status');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-5 py-3.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 font-medium text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Gamepad2 className="w-4 h-4 text-slate-400" />
                  <span>Check Live Floor</span>
                </button>
              </div>

              {/* Feature Highlights Grid */}
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-slate-800/80 mt-6 text-xs text-slate-300">
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                  <div className="text-white font-semibold text-sm">Discrete 1-Hr</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">10 to 11, 14 to 15</div>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                  <div className="text-white font-semibold text-sm">65" 4K OLED</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">120Hz Low Latency</div>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                  <div className="text-white font-semibold text-sm">All Games Free</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">Free Switch Anytime</div>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                  <div className="text-white font-semibold text-sm">Instant Pass</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">Zero Account Needed</div>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Anchor */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-[#101624] shadow-2xl group">
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <img
                    src="/src/assets/images/console_vip_lounge_1790420154213.jpg"
                    alt="CyberCraze Luxury PS5 Lounge"
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
                    loading="eager"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#101624] via-transparent to-transparent opacity-85" />
                  
                  {/* Floating Live Badge */}
                  <div className="absolute top-4 left-4 bg-[#0a0d14]/90 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-semibold text-white">Console Lounge Live</span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 text-xs text-white">
                    <div className="text-xs font-bold uppercase tracking-wider text-blue-400">
                      PlayStation 5 Flagship Suites
                    </div>
                    <div className="text-sm font-semibold mt-0.5">
                      Sony DualSense Wireless · 4K 120Hz OLED · Full Deluxe Library
                    </div>
                  </div>
                </div>

                {/* Quick Booking Strip under image */}
                <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-slate-400">Hourly Rate</div>
                    <div className="text-lg font-bold text-white">৳120 <span className="text-xs text-slate-400 font-normal">/ 1 hour</span></div>
                  </div>
                  <button
                    onClick={() => navigate('/book')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-subtle"
                  >
                    <span>Reserve Station</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. FREE GAME LIBRARY CALLOUT (Zero Need to Pre-Select Game) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="p-6 bg-[#101624] border border-blue-800/40 rounded-2xl shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider bg-blue-950/60 px-3 py-1 rounded-full border border-blue-800/40">
              <Gamepad2 className="w-4 h-4 text-blue-400" />
              <span>All-Access PS5 Library Included Free</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              No Specific Game Selection Required
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              When you reserve any 1-hour slot (such as 10:00 to 11:00 or 15:00 to 16:00), you have unrestricted freedom to switch between EA Sports FC 25, Tekken 8, Marvel's Spider-Man 2, GTA V, Mortal Kombat 1, God of War Ragnarök, NBA 2K25, Gran Turismo 7, and 50+ PS Plus Deluxe titles whenever you wish!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/book')}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-subtle transition-all cursor-pointer text-center"
            >
              Book 1-Hour Slot →
            </button>
          </div>
        </div>
      </section>

      {/* 2.5 VIP MEMBERSHIP PASS CALLOUT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="p-6 bg-gradient-to-r from-amber-950/40 via-[#101624] to-amber-950/30 border border-amber-500/40 rounded-2xl shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider bg-amber-950/70 px-3 py-1 rounded-full border border-amber-800/40">
              <Crown className="w-4 h-4 text-amber-400" />
              <span>CyberCraze VIP Pass System</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Get 1 Free Hour Every Single Day + Automatic Booking Discounts
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Register your phone number in our Cloud SQL backend with a 1-Week or 1-Month VIP Pass. Enjoy 1 free hour daily, book your preferred time slot in advance, and get up to 25% off extra hours with instant QR counter recognition!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/membership')}
              className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer text-center flex items-center justify-center gap-2"
            >
              <Crown className="w-4 h-4" />
              <span>Explore VIP Passes (৳699/wk)</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. LIVE FLOOR STATIONS SECTION */}
      <section id="floor-status" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
              Live Lounge Floor
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              Active PlayStation 5 Stations
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Currently running 2 premium PS5 stations in Akua Hazibari. Real-time availability synced with our booking desk.
            </p>
          </div>

          <button
            onClick={() => navigate('/book')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <span>Book Next Available Slot</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Station Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeDevices.map((device) => {
            const isAvailable = device.status === 'AVAILABLE';
            return (
              <div
                key={device.id}
                className="bg-[#101624] border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden flex flex-col justify-between group transition-all duration-200 shadow-card hover:shadow-card-hover"
              >
                <div>
                  <div className="relative h-56 bg-slate-950 overflow-hidden border-b border-slate-800/80">
                    <img
                      src={device.image}
                      alt={device.name}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#101624] via-transparent to-transparent opacity-85" />
                    
                    <div className="absolute top-3 left-3 bg-[#0a0d14]/90 backdrop-blur-md border border-slate-700/80 px-2.5 py-1 rounded-md text-xs font-mono font-bold text-blue-400">
                      {device.code}
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1.5 backdrop-blur-md ${
                        isAvailable
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                          : 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        {isAvailable ? 'Ready for Play' : 'In Match Session'}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-300">
                      <span className="bg-black/60 px-2.5 py-1 rounded-md backdrop-blur-sm border border-white/10 font-medium">
                        {device.display}
                      </span>
                      <span className="bg-black/60 px-2.5 py-1 rounded-md backdrop-blur-sm border border-white/10 font-medium text-emerald-300">
                        All Games Free
                      </span>
                    </div>
                  </div>

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

                    <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Time Format:</span>
                        <span className="text-white font-medium">Discrete 1-Hour Blocks (10 to 11, etc.)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Controllers:</span>
                        <span className="text-white font-medium">2x DualSense Wireless Included</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Game Freedom:</span>
                        <span className="text-emerald-400 font-medium">Switch to Any Game Anytime Free</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-slate-900/40 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase">Rate</div>
                    <div className="text-xl font-extrabold text-white tabular-nums">
                      ৳{device.hourlyPrice} <span className="text-xs font-normal text-slate-400">/hr</span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/book?device=${device.id}`)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-subtle cursor-pointer"
                  >
                    <span>Book 1-Hour Slot</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Fleet Expansion Notice */}
        <div className="mt-8 p-5 bg-[#101624] border border-slate-800 rounded-2xl shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-blue-400 shrink-0" />
            <div>
              <div className="text-white font-bold text-sm">
                Expanding Hardware: PC & Simulator Battlestations
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                We are currently running 2 flagship PS5 stations. High-end PC rigs and racing cockpits can be added and activated at any time by our cafe admin.
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/devices')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
          >
            View Fleet Details →
          </button>
        </div>
      </section>

      {/* 4. EASY 3-STEP RESERVATION PROCESS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
            Zero Hassle Experience
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            How CyberCraze Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            No registration or account creation needed. Secure your station in 3 simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#101624] border border-slate-800 rounded-2xl p-6 shadow-card space-y-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-400 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h3 className="font-bold text-base text-white">Pick Your 1-Hour Slot</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Choose your PS5 station and 1-hour session block (e.g. 10:00 to 11:00, 14:00 to 15:00). If today is full, jump to the next open day with 1 click.
            </p>
          </div>

          <div className="bg-[#101624] border border-slate-800 rounded-2xl p-6 shadow-card space-y-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-400 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h3 className="font-bold text-base text-white">Instant Pass & Access Code</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Enter your name and mobile number. Receive your digital pass, QR scan code, and SMS confirmation immediately.
            </p>
          </div>

          <div className="bg-[#101624] border border-slate-800 rounded-2xl p-6 shadow-card space-y-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-400 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h3 className="font-bold text-base text-white">Play Any Game Free</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Arrive at Akua Hazibari. Switch between FC 25, Tekken 8, Spider-Man 2, GTA V or any installed title with zero extra charges!
            </p>
          </div>
        </div>
      </section>

      {/* 5. LOCATION & HOURS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="bg-[#101624] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span>Location & Cafe Hours</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              CyberCraze Lounge, Akua Hazibari, Mymensingh
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Open 7 days a week from 10:00 AM to 11:00 PM. High-speed fiber internet, continuous backup power, and comfortable air conditioning.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/contact')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition-colors cursor-pointer"
            >
              Get Directions
            </button>
            <button
              onClick={() => navigate('/book')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-subtle transition-all cursor-pointer"
            >
              Book Station Now →
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
