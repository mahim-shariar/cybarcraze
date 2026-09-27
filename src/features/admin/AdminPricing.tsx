import React, { useState, useEffect } from 'react';
import { cyberStore } from '../../lib/cyberStore';
import { PromoCode, PricingRule } from '../../types';
import { Coins, Plus, Flame, CheckCircle2 } from 'lucide-react';

export const AdminPricing: React.FC = () => {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);

  // New promo form state
  const [promoCode, setPromoCode] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState(10);
  const [minSpend, setMinSpend] = useState(200);
  const [usageLimit, setUsageLimit] = useState(500);

  useEffect(() => {
    const sync = () => {
      setPromos(cyberStore.getPromoCodes());
    };
    sync();
    return cyberStore.subscribe(sync);
  }, []);

  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    cyberStore.getState().promoCodes.push({
      id: `promo-${Date.now()}`,
      code: promoCode.trim().toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minSpend: Number(minSpend),
      usageCount: 0,
      usageLimit: Number(usageLimit),
      active: true
    });

    setPromoCode('');
    setIsPromoModalOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="text-xs font-chakra tracking-widest text-cyan-400 uppercase">
            Revenue Engine & Rules
          </div>
          <h1 className="font-orbitron font-extrabold text-2xl sm:text-3xl text-white mt-1">
            PRICING RULES & PROMOTIONS
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Configure dynamic surge multipliers, peak hours (6-10 PM), weekend pricing, and promo coupon limits.
          </p>
        </div>

        <button
          onClick={() => setIsPromoModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-pink-500 text-slate-950 font-orbitron font-bold text-xs rounded shadow-neon-cyan flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>+ NEW PROMO CODE</span>
        </button>
      </div>

      {/* ACTIVE PROMO CODES */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
        <h3 className="font-orbitron font-bold text-base text-white flex items-center gap-2">
          <Flame className="w-4 h-4 text-pink-400" />
          ACTIVE PROMOTIONS & DISCOUNT CODES
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {promos.map((p) => (
            <div key={p.id} className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2 text-xs font-chakra">
              <div className="flex justify-between items-center">
                <span className="font-orbitron font-bold text-base text-cyan-400">{p.code}</span>
                <span className="text-emerald-400 font-bold uppercase text-[10px]">Active</span>
              </div>
              <div className="text-white font-bold text-sm">
                {p.discountType === 'PERCENTAGE' ? `${p.discountValue}% OFF` : `৳${p.discountValue} OFF`}
              </div>
              <div className="text-slate-400 text-[11px]">
                Min Session Bill: ৳{p.minSpend} · Redemptions: {p.usageCount} / {p.usageLimit}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CREATE PROMO MODAL */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-cyan-500/40 rounded-xl p-6 max-w-md w-full shadow-neon-cyan space-y-4">
            <h3 className="font-orbitron font-extrabold text-lg text-white">CREATE PROMO CODE</h3>
            <form onSubmit={handleCreatePromo} className="space-y-3 text-xs font-chakra">
              <div>
                <label className="block text-slate-400 uppercase mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="e.g. FLASH20"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white uppercase font-orbitron"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 uppercase mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed (৳)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 uppercase mb-1">Discount Value</label>
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 uppercase mb-1">Min Spend (৳)</label>
                  <input
                    type="number"
                    value={minSpend}
                    onChange={(e) => setMinSpend(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase mb-1">Usage Limit</label>
                  <input
                    type="number"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsPromoModalOpen(false)}
                  className="flex-1 py-2 bg-slate-900 text-slate-400 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-cyan-500 text-slate-950 font-orbitron font-bold rounded shadow-neon-cyan"
                >
                  Create Promo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
