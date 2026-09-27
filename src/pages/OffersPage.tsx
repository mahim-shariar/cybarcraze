import React, { useState } from 'react';
import { cyberStore } from '../lib/cyberStore';
import { Tag, Copy, Check, ChevronRight } from 'lucide-react';

interface Props {
  navigate: (path: string) => void;
}

export const OffersPage: React.FC<Props> = ({ navigate }) => {
  const promos = cyberStore.getPromoCodes();
  const [copiedCode, setCopiedCode] = useState<string>('');

  const copyPromo = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
            Special Deals & Promotions
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
            Active Offers & Promo Codes
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2">
            Copy any promo code below and apply it during booking checkout for instant savings.
          </p>
        </div>

        {/* Promo Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {promos.map((promo) => (
            <div
              key={promo.id}
              className="bg-[#101624] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-card hover:shadow-card-hover transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Active Promo</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Min ৳{promo.minSpend}
                  </span>
                </div>

                <div className="text-3xl font-extrabold text-white mb-1">
                  {promo.discountType === 'PERCENTAGE' ? `${promo.discountValue}% OFF` : `৳${promo.discountValue} OFF`}
                </div>
                <p className="text-xs text-slate-400 mb-6">
                  Applicable on reservations exceeding ৳{promo.minSpend}. Valid at CyberCraze HQ.
                </p>

                {/* Promo Code Box */}
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between mb-5">
                  <span className="font-mono font-bold text-sm tracking-wider text-blue-400">
                    {promo.code}
                  </span>
                  <button
                    onClick={() => copyPromo(promo.code)}
                    className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Copy code"
                  >
                    {copiedCode === promo.code ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                onClick={() => navigate(`/book?promo=${promo.code}`)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg shadow-subtle transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Apply & Book Slot</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Night / Clan Tournament Scrims Notice */}
        <div className="p-6 bg-[#101624] border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-card">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-bold text-base text-white">Late Night Tournament Scrims</h3>
            <p className="text-xs text-slate-400">
              Planning an overnight LAN tournament with your college squad or clan? Inquire with our manager for custom lockout rates.
            </p>
          </div>
          <button
            onClick={() => navigate('/contact')}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 whitespace-nowrap cursor-pointer"
          >
            Contact Frontdesk
          </button>
        </div>

      </div>
    </div>
  );
};
