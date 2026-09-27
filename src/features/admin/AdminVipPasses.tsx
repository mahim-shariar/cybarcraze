import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  Plus, 
  Search, 
  Download, 
  Printer, 
  QrCode, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Sparkles,
  X,
  CreditCard,
  Percent
} from 'lucide-react';
import { CyberQRCode } from '../../components/CyberQRCode';

interface VipPass {
  id: string;
  passCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  tier: string;
  startDate: string;
  expiryDate: string;
  dailyMinutesAllowance: number;
  discountPercent: number;
  status: string;
  qrCodeData: string;
  createdAt: string;
}

export const AdminVipPasses: React.FC = () => {
  const [passes, setPasses] = useState<VipPass[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Create Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [tier, setTier] = useState<'WEEKLY_1HR_DAILY' | 'MONTHLY_1HR_DAILY'>('WEEKLY_1HR_DAILY');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // View/Print Pass Card Modal
  const [selectedPass, setSelectedPass] = useState<VipPass | null>(null);

  const fetchPasses = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/vip-passes');
      if (res.ok) {
        const data = await res.json();
        setPasses(data);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error fetching VIP passes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPasses();
  }, []);

  const handleCreatePass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMsg('Player name and phone number are required');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      const res = await fetch('/api/vip-passes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim(),
          tier
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to issue VIP pass');
      }

      const created = await res.json();
      setSuccessMsg(`VIP Pass ${created.passCode} issued for ${created.customerName}!`);
      setIsAddModalOpen(false);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setSelectedPass(created); // Open print/save card immediately
      fetchPasses();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error issuing VIP pass');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPasses = passes.filter(p => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.customerName.toLowerCase().includes(q) ||
      p.customerPhone.includes(q) ||
      p.passCode.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q)
    );
  });

  const handlePrintCard = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>VIP Pass & Membership Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            VIP Passes & Daily 1-Hour Allowance
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Issue memberships, print printable VIP QR cards, and manage daily gaming allowances.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Issue New VIP Pass</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-xl text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-[#101624] border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400 font-medium">Total VIP Passes</div>
          <div className="text-2xl font-bold text-white mt-1">{passes.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Registered in Cloud SQL</div>
        </div>
        <div className="p-4 bg-[#101624] border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400 font-medium">Daily 1-Hour Allowance</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">60 Mins / Day</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Single scan per calendar day rule</div>
        </div>
        <div className="p-4 bg-[#101624] border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400 font-medium">Member Extra Discount</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">20% – 25% OFF</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Applied on extra station hours</div>
        </div>
      </div>

      {/* Search & List */}
      <div className="bg-[#101624] border border-slate-800 rounded-2xl overflow-hidden shadow-card">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, phone, or pass code..."
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <span className="text-xs text-slate-400 self-end sm:self-auto">
            {filteredPasses.length} VIP Members Found
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading VIP passes...</div>
        ) : filteredPasses.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No VIP passes match your filter. Click "Issue New VIP Pass" to add one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                  <th className="py-3 px-4">Pass Code & Member</th>
                  <th className="py-3 px-4">Tier & Discount</th>
                  <th className="py-3 px-4">Daily Free Time</th>
                  <th className="py-3 px-4">Validity</th>
                  <th className="py-3 px-4 text-right">Card Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredPasses.map((pass) => (
                  <tr key={pass.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-400 text-sm">{pass.passCode}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-950/60 text-amber-300 border border-amber-800/40">
                          ACTIVE
                        </span>
                      </div>
                      <div className="font-semibold text-white mt-0.5">{pass.customerName}</div>
                      <div className="text-slate-400 font-mono text-[11px] flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>{pass.customerPhone}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-white">
                        {pass.tier === 'MONTHLY_1HR_DAILY' ? '1-Month VIP (30 Days)' : '1-Week VIP (7 Days)'}
                      </div>
                      <div className="text-emerald-400 font-semibold text-[11px] mt-0.5">
                        +{pass.discountPercent}% Discount on Extra Hours
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-950/70 text-emerald-300 border border-emerald-800/40">
                        <Clock className="w-3.5 h-3.5" />
                        <span>1 Hour / Day</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-300 text-[11px]">{pass.startDate} to {pass.expiryDate}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Scanned at counter</div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedPass(pass)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 ml-auto cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>View & Print Card</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ISSUE NEW VIP PASS MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121624] border border-amber-500/40 rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">Issue New VIP Pass</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePass} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Customer Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Tanvir Ahmed"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Customer Mobile Phone <span className="text-rose-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="01700000000"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="player@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  VIP Membership Tier
                </label>
                <select
                  value={tier}
                  onChange={(e) => setTier(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="WEEKLY_1HR_DAILY">1-Week Pass (7 Days · 1 Hour Free Daily · ৳699)</option>
                  <option value="MONTHLY_1HR_DAILY">1-Month Pass (30 Days · 1 Hour Free Daily · ৳2,499)</option>
                </select>
              </div>

              <div className="p-3 bg-amber-950/40 border border-amber-800/40 rounded-xl text-[11px] text-amber-300 space-y-1">
                <div>✓ 1 Hour Free Daily Gaming allowance initialized immediately.</div>
                <div>✓ Enforces strict 1-scan-per-calendar-day counter validation.</div>
                <div>✓ Printable pass card generated automatically upon creation.</div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-900 text-slate-300 rounded-xl hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Issuing Pass...' : 'Issue VIP Pass'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW & PRINT VIP PASS MODAL */}
      {selectedPass && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#101420] border border-amber-500/50 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">VIP Membership Card</h3>
              </div>
              <button onClick={() => setSelectedPass(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stylized Printable Badge Card */}
            <div className="bg-gradient-to-br from-[#0c0f1a] to-[#161c2d] border border-amber-500/40 rounded-2xl p-5 shadow-xl space-y-4 text-center">
              <div className="flex justify-between items-center text-left border-b border-slate-800 pb-3">
                <div>
                  <div className="text-[10px] text-amber-400 font-bold tracking-widest uppercase">CYBERCRAZE HQ</div>
                  <div className="text-base font-extrabold text-white">{selectedPass.customerName}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{selectedPass.customerPhone}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase">Code</div>
                  <div className="text-base font-mono font-bold text-amber-400">{selectedPass.passCode}</div>
                </div>
              </div>

              {/* Pristine Clean QR Code (No center obstruction) */}
              <div className="flex justify-center py-1">
                <CyberQRCode 
                  value={selectedPass.qrCodeData}
                  size={180}
                  passTitle="CYBERCRAZE HQ"
                  subtitle={`${selectedPass.tier.replace(/_/g, ' ')} PASS`}
                  downloadFilename={`cybercraze-vippass-${selectedPass.passCode.toLowerCase()}`}
                  showDownloadButton={true}
                />
              </div>

              <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1 text-xs text-left">
                <div className="flex justify-between">
                  <span className="text-slate-400">Daily Free Time:</span>
                  <span className="text-emerald-400 font-bold">1 Hour Every Day</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Valid Period:</span>
                  <span className="text-white font-medium">{selectedPass.startDate} to {selectedPass.expiryDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Extra Bookings:</span>
                  <span className="text-blue-400 font-bold">{selectedPass.discountPercent}% Member Discount</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 italic">
                Present this QR pass on your phone or printout at the frontdesk for instant 1-hour station launch.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handlePrintCard}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-800 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Card</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedPass(null)}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
