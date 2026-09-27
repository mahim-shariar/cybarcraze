import React from 'react';
import { Home, Monitor, CalendarPlus, Search, ShieldCheck } from 'lucide-react';

interface Props {
  currentPath: string;
  navigate: (path: string) => void;
}

export const MobileNav: React.FC<Props> = ({ currentPath, navigate }) => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c101a]/95 backdrop-blur-lg border-t border-slate-800 px-3 py-1.5 flex items-center justify-around shadow-2xl">
      <button
        onClick={() => navigate('/')}
        className={`flex flex-col items-center py-1 px-2 transition-colors ${
          currentPath === '/' ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Home className="w-4 h-4" />
        <span className="text-[11px] mt-0.5">Home</span>
      </button>

      <button
        onClick={() => navigate('/devices')}
        className={`flex flex-col items-center py-1 px-2 transition-colors ${
          currentPath === '/devices' ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Monitor className="w-4 h-4" />
        <span className="text-[11px] mt-0.5">Stations</span>
      </button>

      {/* Main Elevated CTA */}
      <button
        onClick={() => navigate('/book')}
        className="flex flex-col items-center -mt-4 group"
      >
        <div className="w-11 h-11 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg group-active:scale-95 transition-transform">
          <CalendarPlus className="w-5 h-5" />
        </div>
        <span className="text-[11px] font-semibold text-blue-400 mt-0.5">Book</span>
      </button>

      <button
        onClick={() => navigate('/booking/manage')}
        className={`flex flex-col items-center py-1 px-2 transition-colors ${
          currentPath === '/booking/manage' ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Search className="w-4 h-4" />
        <span className="text-[11px] mt-0.5">My Pass</span>
      </button>

      <button
        onClick={() => navigate('/admin')}
        className={`flex flex-col items-center py-1 px-2 transition-colors ${
          currentPath.startsWith('/admin') ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <ShieldCheck className="w-4 h-4" />
        <span className="text-[11px] mt-0.5">Staff</span>
      </button>
    </div>
  );
};
