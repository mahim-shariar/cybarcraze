import React, { useState } from 'react';
import { Crown, Check, Sparkles, QrCode, ArrowRight, ShieldCheck, Copy, Phone, User, Calendar, CheckCircle2 } from 'lucide-react';
import { CyberQRCode } from '../components/CyberQRCode';
import confetti from 'canvas-confetti';

interface Props {
  navigate: (path: string) => void;
}

export const MembershipPage: React.FC<Props> = ({ navigate }) => {
  const [selectedTier, setSelectedTier] = useState<'WEEKLY_1HR_DAILY' | 'MONTHLY_1HR_DAILY'>('WEEKLY_1HR_DAILY');
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [preferredDailyTime, setPreferredDailyTime] = useState('FLEXIBLE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdPass, setCreatedPass] = useState<any | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // VIP Pass Lookup state
  const [lookupPhone, setLookupPhone] = useState('');
  const [lookedUpPass, setLookedUpPass] = useState<any | null>(null);
  const [lookupError, setLookupError] = useState('');

  const handlePurchaseVip = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMsg('Please enter your full name and mobile phone number.');
      return;
    }

    if (customerPhone.trim().length < 9) {
      setErrorMsg('Please enter a valid mobile number (e.g. 01712345678).');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/vip-passes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim(),
          tier: selectedTier
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to register VIP pass');
      }

      const pass = await res.json();
      setCreatedPass(pass);
      setIsSubmitting(false);

      try {
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      } catch (e) {}

    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Error creating VIP pass.');
    }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError('');
    setLookedUpPass(null);

    if (!lookupPhone.trim()) {
      setLookupError('Enter your registered VIP phone number or pass code.');
      return;
    }

    try {
      const res = await fetch(`/api/vip-passes/lookup?q=${encodeURIComponent(lookupPhone.trim())}`);
      if (!res.ok) {
        throw new Error('No active VIP pass found with this phone number.');
      }
      const data = await res.json();
      setLookedUpPass(data);
    } catch (err: any) {
      setLookupError(err.message || 'Pass not found.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider bg-amber-950/40 px-3 py-1 rounded-full border border-amber-800/40 mb-3">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>CyberCraze VIP Membership</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            VIP Gamer Pass
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Register your phone number in our backend. Enjoy <strong>1 free hour of PS5 gaming every single day</strong>, automatic discounts on every booking, and instant QR pass counter recognition!
          </p>
        </div>

        {/* Pass Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* 1-Week VIP Daily Pass */}
          <div className={`bg-[#101624] border rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-200 shadow-card hover:shadow-card-hover relative ${
            selectedTier === 'WEEKLY_1HR_DAILY' ? 'border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.15)]' : 'border-slate-800'
          }`}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-800/40">
                  7-Day Pass
                </span>
                <span className="text-xs text-slate-400 font-medium">Daily 1 Hour Free</span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">1-Week VIP Daily Pass</h3>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-extrabold text-white">৳699</span>
                  <span className="text-xs text-slate-400 line-through">৳840</span>
                  <span className="text-xs text-emerald-400 font-semibold">Save ৳140+</span>
                </div>
                <p className="text-xs text-slate-300 mt-2">
                  Perfect for an intensive week of ranked matches, co-op tournaments, or campaign grinding.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-2.5 text-xs text-slate-300">
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>1 Free Hour Every Day for 7 Days</strong> (7 hours total worth ৳840)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Phone Registered in Backend</strong>: Auto-recognized when booking</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>20% Off Extra Bookings</strong>: Any additional hours beyond daily allowance</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Instant QR Pass Recognition</strong> at cafe counter</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Advance Schedule Booking</strong> or walk-in priority</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={() => {
                  setSelectedTier('WEEKLY_1HR_DAILY');
                  setIsPurchaseModalOpen(true);
                }}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Get 1-Week Pass (৳699)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 1-Month VIP Daily Pass */}
          <div className={`bg-[#101624] border rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-200 shadow-card hover:shadow-card-hover relative ${
            selectedTier === 'MONTHLY_1HR_DAILY' ? 'border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.15)]' : 'border-slate-800'
          }`}>
            <div className="absolute -top-3 right-6 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow-md">
              BEST VALUE
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-800/40">
                  30-Day Pass
                </span>
                <span className="text-xs text-slate-400 font-medium">Daily 1 Hour Free</span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">1-Month VIP Daily Pass</h3>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-extrabold text-white">৳2,499</span>
                  <span className="text-xs text-slate-400 line-through">৳3,600</span>
                  <span className="text-xs text-emerald-400 font-semibold">Save ৳1,100+</span>
                </div>
                <p className="text-xs text-slate-300 mt-2">
                  The ultimate pass for passionate gamers in Mymensingh. 30 daily hours + maximum discount privileges.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-2.5 text-xs text-slate-300">
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>1 Free Hour Every Day for 30 Days</strong> (30 hours worth ৳3,600)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Phone Registered in Cloud SQL</strong>: Permanent VIP tier status</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>25% Off All Extra Hours</strong> for yourself and party guests</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Free Entry to Monthly FC 25 & Tekken Tournaments</strong></span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Guaranteed Advance Slot Scheduling</strong> anytime</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={() => {
                  setSelectedTier('MONTHLY_1HR_DAILY');
                  setIsPurchaseModalOpen(true);
                }}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Get 1-Month Pass (৳2,499)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Existing Pass Lookup Tool */}
        <div className="max-w-2xl mx-auto bg-[#101624] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Already Have a VIP Pass?</h3>
              <p className="text-xs text-slate-400">Lookup your pass to view remaining days, QR code, or daily hour status.</p>
            </div>
          </div>

          <form onSubmit={handleLookup} className="flex gap-2">
            <input
              type="text"
              value={lookupPhone}
              onChange={(e) => setLookupPhone(e.target.value)}
              placeholder="Enter your registered phone number (e.g. 01712345678)"
              className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Lookup Pass
            </button>
          </form>

          {lookupError && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-xs">
              {lookupError}
            </div>
          )}

          {lookedUpPass && (
            <div className="mt-4 p-5 bg-[#0a0d14] border border-amber-500/30 rounded-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-400">{lookedUpPass.pass.tier.replace('_', ' ')}</span>
                    <span className="text-[10px] bg-emerald-950/60 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800/40">Active Pass</span>
                  </div>
                  <h4 className="text-lg font-bold text-white mt-1">{lookedUpPass.pass.customerName}</h4>
                  <div className="text-xs text-slate-400">Phone: {lookedUpPass.pass.customerPhone}</div>
                </div>
                <div className="p-2.5 bg-white rounded-xl shadow-sm self-start sm:self-auto">
                  <CyberQRCode value={lookedUpPass.pass.qrCodeData} size={90} />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 bg-slate-900 rounded-lg">
                  <div className="text-slate-500 text-[11px]">Valid Until</div>
                  <div className="text-white font-medium mt-0.5">{lookedUpPass.pass.expiryDate}</div>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-lg">
                  <div className="text-slate-500 text-[11px]">Today's Free Hour</div>
                  <div className={`font-semibold mt-0.5 ${lookedUpPass.dailyAvailableToday ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {lookedUpPass.dailyAvailableToday ? 'Available Today' : 'Consumed Today'}
                  </div>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-lg">
                  <div className="text-slate-500 text-[11px]">Extra Hours Discount</div>
                  <div className="text-blue-400 font-semibold mt-0.5">{lookedUpPass.pass.discountPercent}% Off</div>
                </div>
              </div>

              <button
                onClick={() => navigate('/book')}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-subtle transition-all cursor-pointer"
              >
                Book Your 1-Hour Session Now →
              </button>
            </div>
          )}
        </div>

      </div>

      {/* REGISTRATION MODAL */}
      {isPurchaseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101624] border border-amber-500/40 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            {!createdPass ? (
              <form onSubmit={handlePurchaseVip} className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-400" />
                    <h3 className="font-bold text-base text-white">
                      Register {selectedTier === 'WEEKLY_1HR_DAILY' ? '1-Week' : '1-Month'} VIP Pass
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPurchaseModalOpen(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-3 bg-amber-950/20 border border-amber-800/30 rounded-xl text-xs text-amber-300">
                  Your phone number will be registered in our Cloud SQL backend. When you book sessions, our system will automatically apply your 1 free daily hour and VIP discount!
                </div>

                {errorMsg && (
                  <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-xs">
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Your Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Tanvir Ahmed"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Mobile Phone Number (Backend Identifier) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 01712345678"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="e.g. tanvir@gmail.com"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Preferred Daily Gaming Time Slot:
                  </label>
                  <select
                    value={preferredDailyTime}
                    onChange={(e) => setPreferredDailyTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="FLEXIBLE">Flexible (Book advance 1-hour slot anytime on website)</option>
                    <option value="14:00">Fixed Daily: 14:00 - 15:00 (Afternoon)</option>
                    <option value="15:00">Fixed Daily: 15:00 - 16:00 (Afternoon)</option>
                    <option value="16:00">Fixed Daily: 16:00 - 17:00 (Prime Gaming)</option>
                    <option value="17:00">Fixed Daily: 17:00 - 18:00 (Evening)</option>
                    <option value="18:00">Fixed Daily: 18:00 - 19:00 (Evening)</option>
                    <option value="19:00">Fixed Daily: 19:00 - 20:00 (Night Rush)</option>
                    <option value="20:00">Fixed Daily: 20:00 - 21:00 (Night Rush)</option>
                    <option value="21:00">Fixed Daily: 21:00 - 22:00 (Late Night)</option>
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    You can play your 1 daily free hour at this fixed time or reschedule in advance anytime.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Total Price:</span>
                  <span className="text-lg font-bold text-amber-400">
                    {selectedTier === 'WEEKLY_1HR_DAILY' ? '৳699' : '৳2,499'}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? 'Registering in Cloud SQL...' : 'Confirm & Activate VIP Pass'}
                </button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-lg text-white">VIP Pass Activated!</h3>
                <p className="text-xs text-slate-300">
                  Your phone number <strong>{createdPass.customerPhone}</strong> is now registered in our Cloud SQL database. Use it whenever booking to receive 1 Free Hour every day & automatic discounts!
                </p>

                <div className="inline-block mx-auto my-2">
                  <CyberQRCode 
                    value={createdPass.qrCodeData} 
                    size={140} 
                    downloadFilename={`cybercraze-vippass-${createdPass.passCode.toLowerCase()}`}
                    showDownloadButton={true}
                  />
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs space-y-1 text-left">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pass Code:</span>
                    <span className="font-mono font-bold text-amber-400">{createdPass.passCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Validity:</span>
                    <span className="text-white font-medium">{createdPass.startDate} to {createdPass.expiryDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Daily Allowance:</span>
                    <span className="text-emerald-400 font-semibold">1 Hour Free Every Day</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Time Preference:</span>
                    <span className="text-slate-200 font-medium">
                      {preferredDailyTime === 'FLEXIBLE' ? 'Flexible (Advance Booking)' : `${preferredDailyTime}:00 Daily`}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const ph = createdPass.customerPhone;
                      setIsPurchaseModalOpen(false);
                      setCreatedPass(null);
                      navigate(`/book?phone=${encodeURIComponent(ph)}`);
                    }}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Book Advance Slot (৳0 Free) →
                  </button>
                  <button
                    onClick={() => {
                      setIsPurchaseModalOpen(false);
                      setCreatedPass(null);
                    }}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
