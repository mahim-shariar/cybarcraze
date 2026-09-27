import React from 'react';
import { CyberLogo } from './CyberLogo';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  ShieldCheck, 
  MessageSquare
} from 'lucide-react';

interface Props {
  navigate: (path: string) => void;
}

export const Footer: React.FC<Props> = ({ navigate }) => {
  return (
    <footer className="bg-[#080b12] border-t border-slate-800 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="space-y-4">
            <CyberLogo size="md" />
            <p className="text-xs text-slate-400 leading-relaxed mt-2">
              Mymensingh’s flagship premium gaming lounge. High-FPS competitive PC esports rigs, direct-drive racing simulators, 4K PlayStation 5 stations, and private squad lounges.
            </p>
            <div className="pt-2">
              <a 
                href="https://wa.me/8801712345678" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/40 px-3.5 py-2 rounded-lg transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                WhatsApp Frontdesk Support
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-200">
              Explore
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <button onClick={() => navigate('/book')} className="hover:text-blue-400 transition-colors text-left">
                  Book a Station
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/devices')} className="hover:text-blue-400 transition-colors text-left">
                  Station Hardware & Specs
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/zones')} className="hover:text-blue-400 transition-colors text-left">
                  Gaming Zones
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/pricing')} className="hover:text-blue-400 transition-colors text-left">
                  Rates & Packages
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/offers')} className="hover:text-blue-400 transition-colors text-left">
                  Discounts & Night Passes
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/membership')} className="hover:text-blue-400 transition-colors text-left">
                  VIP Club Perks
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/booking/manage')} className="hover:text-blue-400 transition-colors text-left">
                  Lookup Booking Pass
                </button>
              </li>
            </ul>
          </div>

          {/* Location & Hours */}
          <div className="space-y-3">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-200">
              Location & Hours
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  Akua Hazibari – Shadar,<br />
                  Mymensingh, Bangladesh
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <span>+880 1712-345678</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>contact@cybercraze.gg</span>
              </div>
              <div className="flex items-start gap-2.5 pt-1">
                <Clock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-slate-200 font-medium">Sat – Thu: 10:00 AM – 11:00 PM</div>
                  <div className="text-slate-400">Friday: 02:00 PM – 11:30 PM</div>
                </div>
              </div>
            </div>
          </div>

          {/* Guest Policy & Staff Login */}
          <div className="space-y-3">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-200">
              Guest Booking
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              No account creation needed. Provide your name & phone number to lock down your setup. Instant digital pass issued immediately.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigate('/admin')}
                className="w-full py-2.5 px-3.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-lg text-xs font-medium flex items-center justify-between transition-colors"
              >
                <span>Staff & Management Console</span>
                <ShieldCheck className="w-4 h-4 text-blue-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © 2026 CYBERCRAZE – HQ Gaming Space. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/booking-policy')} className="hover:text-slate-300 transition-colors">
              Booking Policy
            </button>
            <span>·</span>
            <button onClick={() => navigate('/cancellation-policy')} className="hover:text-slate-300 transition-colors">
              Cancellation Policy
            </button>
            <span>·</span>
            <button onClick={() => navigate('/terms')} className="hover:text-slate-300 transition-colors">
              Terms of Play
            </button>
            <span>·</span>
            <button onClick={() => navigate('/privacy')} className="hover:text-slate-300 transition-colors">
              Privacy
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
