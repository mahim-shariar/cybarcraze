import React from 'react';
import { ChevronRight, CheckCircle2, Sparkles, Gamepad2 } from 'lucide-react';

interface Props {
  navigate: (path: string) => void;
}

export const ZonesPage: React.FC<Props> = ({ navigate }) => {
  const zones = [
    {
      title: 'Console Lounge & Squad Hub',
      subtitle: 'PlayStation 5 4K 120Hz OLED Arena',
      rate: '৳120 / hour (Discrete 1-Hr Sessions)',
      image: '/src/assets/images/console_vip_lounge_1790420154213.jpg',
      status: 'ACTIVE',
      specs: [
        'Sony PlayStation 5 flagship consoles (Station 01 & Station 02)',
        '65" LG C3 OLED 4K 120Hz displays with low latency and VRR',
        '2x DualSense wireless controllers included (up to 4 supported)',
        'Full Deluxe library free: FC 25, Tekken 8, Spider-Man 2, GTA V, Mortal Kombat 1',
        'Unrestricted free game switching during your booked hour'
      ],
      description: 'The centerpiece of CyberCraze. 2 premier PS5 stations featuring deep leather sofa lounge seating, tournament screens, and surround sound.',
      catId: 'cat-ps5'
    },
    {
      title: 'Alpha Battle Arena',
      subtitle: 'Tournament-Grade Esports PC Fleet',
      rate: 'Coming Soon',
      image: '/src/assets/images/pc_gaming_station_1790420126371.jpg',
      status: 'EXPANDING',
      specs: [
        'NVIDIA GeForce RTX 4080 & 4070Ti Super GPUs',
        '240Hz 0.03ms OLED & Fast-IPS BenQ Displays',
        'Wooting 60HE Hall-effect Rapid Trigger Keyboards',
        'Logitech G Pro X Superlight 2 Wireless Mice',
        'Direct Gigabit LAN with low ping to competitive servers'
      ],
      description: 'Engineered specifically for tactical competitive shooters (Valorant, CS2, Apex Legends). Configured in database and will be activated by admin as new gear is deployed.',
      catId: 'cat-pc'
    },
    {
      title: 'Apex Velocity Bay',
      subtitle: 'Full-Motion Direct-Drive Racing Cockpits',
      rate: 'Coming Soon',
      image: '/src/assets/images/racing_simulator_rig_1790420141279.jpg',
      status: 'EXPANDING',
      specs: [
        'Fanatec ClubSport DD+ 15Nm Direct-Drive Wheelbase',
        'Hydraulic feel load-cell brake pedals with realistic progression',
        'Samsung Odyssey Neo G9 49" 240Hz Dual-QHD curved display',
        'Sim-Lab P1X Pro aluminum chassis & Sparco bucket seats',
        'Realistic force feedback for F1 24, Assetto Corsa, and Forza'
      ],
      description: 'The pinnacle of motorsport simulation in Mymensingh. Telemetry and direct-drive hardware are scheduled for upcoming lounge launch.',
      catId: 'cat-racing'
    },
    {
      title: 'CyberVault VIP Suite',
      subtitle: 'Private Soundproof Squad Sanctuary',
      rate: 'Coming Soon',
      image: '/src/assets/images/hero_esports_lounge_1790420114656.jpg',
      status: 'EXPANDING',
      specs: [
        'Exclusive private room accommodating up to 8 guests',
        '85" Sony 4K 120Hz home theater display',
        'Dual RTX 4090 custom liquid-cooled battle rigs + PS5 console',
        'Soundproof acoustic walls and ambient lighting controls',
        'Private service buzzer and luxury leather recliners'
      ],
      description: 'The ultimate space for private squad scrims, birthdays, and high-stakes tournament finals.',
      catId: 'cat-vip'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
            Custom Gaming Environments
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
            CyberCraze Gaming Zones
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2">
            Currently running 2 flagship PlayStation 5 stations in Akua Hazibari, with PC and simulator zones expanding soon.
          </p>
        </div>

        <div className="space-y-10">
          {zones.map((zone) => {
            const isActive = zone.status === 'ACTIVE';

            return (
              <div
                key={zone.title}
                className="bg-[#101624] border border-slate-800 rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-card hover:shadow-card-hover transition-all"
              >
                <div className="lg:col-span-6 h-72 sm:h-84 relative bg-slate-950 overflow-hidden">
                  <img
                    src={zone.image}
                    alt={zone.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#101624] via-transparent to-transparent opacity-80" />
                  
                  <div className="absolute top-4 left-4">
                    {isActive ? (
                      <span className="px-3 py-1 bg-emerald-950/80 border border-emerald-800/60 rounded-full text-xs font-semibold text-emerald-400 flex items-center gap-1.5 backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Live & Open for Booking
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-slate-900/80 border border-slate-700/60 rounded-full text-xs font-semibold text-slate-300 flex items-center gap-1.5 backdrop-blur-md">
                        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                        Fleet Expansion · Coming Soon
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-4 left-4">
                    <div className="font-bold text-lg text-white">{zone.title}</div>
                    <div className="text-xs text-blue-400 font-medium">{zone.subtitle}</div>
                  </div>
                </div>

                <div className="lg:col-span-6 p-6 sm:p-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white tabular-nums">
                      {zone.rate}
                    </span>
                    <span className="text-xs text-slate-400">Akua Hazibari HQ</span>
                  </div>

                  <h3 className="font-bold text-xl text-white">{zone.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {zone.description}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Specifications</div>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {zone.specs.map(spec => (
                        <li key={spec} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                          <span>{spec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2">
                    {isActive ? (
                      <button
                        onClick={() => navigate('/book')}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-subtle transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <span>Reserve 1-Hour Slot in This Zone</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate('/book')}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                      >
                        Book PS5 Station Instead →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
