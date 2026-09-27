import React, { useState, useEffect } from 'react';
import { CyberLogo } from './CyberLogo';
import { cyberStore } from '../lib/cyberStore';
import { 
  Search, 
  Menu, 
  X, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface Props {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Navbar: React.FC<Props> = ({ currentPath, navigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [availableCount, setAvailableCount] = useState(0);

  useEffect(() => {
    const updateStats = () => {
      const devices = cyberStore.getDevices();
      const free = devices.filter(d => d.status === 'AVAILABLE' && d.active).length;
      setAvailableCount(free);
    };
    updateStats();
    return cyberStore.subscribe(updateStats);
  }, []);

  const navLinks = [
    { label: 'Stations', path: '/devices' },
    { label: 'Zones', path: '/zones' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'Offers', path: '/offers' },
    { label: 'Find Booking', path: '/booking/manage' },
    { label: 'Contact', path: '/contact' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0c101a]/95 backdrop-blur-md border-b border-slate-800 transition-colors">
      {/* Top Utility Bar */}
      <div className="bg-[#090d16] border-b border-slate-800/80 px-4 py-1.5 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>{availableCount} Stations Available Now</span>
            </span>
            <span className="hidden sm:inline text-slate-700">·</span>
            <span className="hidden sm:flex items-center gap-1 text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              Akua Hazibari, Mymensingh
            </span>
            <span className="hidden md:inline text-slate-700">·</span>
            <span className="hidden md:flex items-center gap-1 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              10:00 AM – 11:00 PM Daily
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => navigate('/booking/manage')}
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <Search className="w-3 h-3 text-slate-400" />
              <span>Lookup Pass</span>
            </button>
            <span className="text-slate-800">|</span>
            <button
              onClick={() => navigate('/admin')}
              className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1 font-medium"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Staff Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand Logo */}
          <div 
            onClick={() => navigate('/')} 
            className="cursor-pointer py-1.5 flex items-center transition-opacity hover:opacity-90"
          >
            <CyberLogo size="md" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`text-sm font-medium transition-colors py-1 ${
                    isActive 
                      ? 'text-blue-400 font-semibold border-b-2 border-blue-500 -mb-0.5' 
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Desktop Right CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={() => navigate('/book')}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow-subtle hover:shadow-card-hover transition-all duration-200 flex items-center gap-2 cursor-pointer"
            >
              <span>Book a Station</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => navigate('/book')}
              className="bg-blue-600 text-white font-medium text-xs px-3.5 py-1.5 rounded-md"
            >
              Book Now
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white rounded-md"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0d121c] border-b border-slate-800 px-4 pt-3 pb-6 space-y-3">
          <div className="grid grid-cols-1 gap-1 pt-1">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => {
                  navigate(link.path);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center justify-between text-left px-3.5 py-2.5 rounded-lg text-sm font-medium ${
                  currentPath === link.path
                    ? 'bg-blue-600/15 text-blue-400 font-semibold'
                    : 'text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span>{link.label}</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            <button
              onClick={() => {
                navigate('/book');
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-lg text-center shadow-subtle"
            >
              Book a Gaming Session
            </button>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  navigate('/booking/manage');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2 text-xs font-medium text-slate-300 bg-slate-800/80 border border-slate-700/60 rounded-md text-center hover:bg-slate-800"
              >
                Lookup Pass
              </button>
              <button
                onClick={() => {
                  navigate('/admin');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2 text-xs font-medium text-slate-300 bg-slate-800/80 border border-slate-700/60 rounded-md text-center hover:bg-slate-800"
              >
                Staff Portal
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
