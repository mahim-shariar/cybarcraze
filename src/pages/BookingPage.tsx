import React, { useState, useEffect, useMemo } from 'react';
import { cyberStore } from '../lib/cyberStore';
import { Device, Booking } from '../types';
import { CyberQRCode } from '../components/CyberQRCode';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import {
  Gamepad2,
  CalendarCheck2,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Copy,
  Printer,
  ChevronRight,
  ShieldCheck,
  Check,
  Tag,
  Crown,
  RotateCw,
  Sparkles,
  Download
} from 'lucide-react';

interface Props {
  navigate: (path: string) => void;
  initialDeviceId?: string;
  initialCategory?: string;
  initialPromo?: string;
  initialPhone?: string;
}

export const BookingPage: React.FC<Props> = ({
  navigate,
  initialDeviceId,
  initialPromo,
  initialPhone
}) => {
  // Store Data
  const [devices, setDevices] = useState<Device[]>([]);
  const [settings, setSettings] = useState(cyberStore.getSettings());

  // Form State - Selected Device & Date
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [bookBothStations, setBookBothStations] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Time & Duration: Discrete 1-hour sessions (1 to 4 hours)
  const [selectedStartTime, setSelectedStartTime] = useState<string>('14:00');
  const [durationHours, setDurationHours] = useState<number>(1); // 1, 2, 3, 4 hours

  // Customer Information (No login required)
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>(initialPhone || '');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerNotes, setCustomerNotes] = useState<string>('');

  // VIP Pass Detection state
  const [vipPassInfo, setVipPassInfo] = useState<{
    pass: any;
    dailyAvailableToday: boolean;
  } | null>(null);
  const [isCheckingVip, setIsCheckingVip] = useState<boolean>(false);

  // Promo & Payment
  const [promoCodeInput, setPromoCodeInput] = useState<string>(initialPromo || '');
  const [appliedPromo, setAppliedPromo] = useState<string>(initialPromo || '');
  const [promoError, setPromoError] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'BKASH' | 'CASH'>('BKASH');

  // Booking result / error states
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string>('');
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [switchFlash, setSwitchFlash] = useState<boolean>(false);

  // Sync store & cleanup expired past bookings
  useEffect(() => {
    const sync = () => {
      // Filter for active devices (currently the 2 PS5s)
      const activeDevs = cyberStore.getDevices().filter(d => d.active);
      setDevices(activeDevs);
      setSettings(cyberStore.getSettings());
    };
    sync();

    // Trigger past-day booking cleanup on backend
    fetch('/api/bookings/cleanup', { method: 'POST' }).catch(() => {});

    return cyberStore.subscribe(sync);
  }, []);

  // Set initial device
  useEffect(() => {
    const activeDevs = cyberStore.getDevices().filter(d => d.active);
    if (activeDevs.length > 0) {
      if (initialDeviceId && activeDevs.some(d => d.id === initialDeviceId)) {
        setSelectedDeviceId(initialDeviceId);
      } else if (!activeDevs.some(d => d.id === selectedDeviceId)) {
        setSelectedDeviceId(activeDevs[0].id);
      }
    }
  }, [initialDeviceId, selectedDeviceId]);

  // VIP Phone auto-detection
  useEffect(() => {
    const clean = customerPhone.trim();
    if (clean.length >= 10) {
      setIsCheckingVip(true);
      fetch(`/api/vip-passes/lookup?q=${encodeURIComponent(clean)}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          setVipPassInfo(data);
          setIsCheckingVip(false);
          if (data?.pass && !customerName) {
            setCustomerName(data.pass.customerName);
          }
        })
        .catch(() => {
          setVipPassInfo(null);
          setIsCheckingVip(false);
        });
    } else {
      setVipPassInfo(null);
    }
  }, [customerPhone]);

  // Allowed date options (Next 14 days)
  const dateOptions = useMemo(() => {
    const days: { dateStr: string; label: string; dayName: string }[] = [];
    const now = new Date();
    for (let i = 0; i < (settings.advanceBookingDays || 14); i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      const str = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      days.push({ dateStr: str, label, dayName });
    }
    return days;
  }, [settings.advanceBookingDays]);

  // Duration in minutes
  const durationMinutes = durationHours * 60;

  // Discrete 1-Hour Time Slots ONLY (10:00 to 22:00)
  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    for (let h = 10; h <= 22; h++) {
      slots.push(`${String(h).padStart(2, '0')}:00`);
    }
    return slots;
  }, []);

  const selectedDevice = useMemo(() => {
    return devices.find(d => d.id === selectedDeviceId) || devices[0];
  }, [devices, selectedDeviceId]);

  const formatTime12h = (t: string) => {
    const [hStr, mStr] = t.split(':');
    const h = parseInt(hStr, 10);
    const m = mStr || '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${m} ${ampm}`;
  };

  const calculatedEndTime = useMemo(() => {
    return cyberStore.calculateEndTime(selectedStartTime, durationMinutes);
  }, [selectedStartTime, durationMinutes]);

  const currentSlotAvailability = useMemo(() => {
    if (!selectedDevice) return { available: false, reason: 'Select a station' };
    return cyberStore.isDeviceAvailable(selectedDevice.id, selectedDate, selectedStartTime, calculatedEndTime);
  }, [selectedDevice, selectedDate, selectedStartTime, calculatedEndTime]);

  const availableSlotsOnSelectedDate = useMemo(() => {
    if (!selectedDevice) return [];
    return timeSlots.filter(time => {
      const endT = cyberStore.calculateEndTime(time, durationMinutes);
      const check = cyberStore.isDeviceAvailable(selectedDevice.id, selectedDate, time, endT);
      return check.available;
    });
  }, [selectedDevice, selectedDate, durationMinutes, timeSlots]);

  const otherDevice = useMemo(() => {
    return devices.find(d => d.id !== selectedDeviceId && d.active);
  }, [devices, selectedDeviceId]);

  const otherDeviceSlotsOnSelectedDate = useMemo(() => {
    if (!otherDevice) return [];
    return timeSlots.filter(time => {
      const endT = cyberStore.calculateEndTime(time, durationMinutes);
      return cyberStore.isDeviceAvailable(otherDevice.id, selectedDate, time, endT).available;
    });
  }, [otherDevice, selectedDate, durationMinutes, timeSlots]);

  const nextAvailableDateInfo = useMemo(() => {
    if (!selectedDevice || availableSlotsOnSelectedDate.length > 0) return null;

    const currentIndex = dateOptions.findIndex(d => d.dateStr === selectedDate);
    for (let i = currentIndex + 1; i < dateOptions.length; i++) {
      const candidateDate = dateOptions[i];
      const candidateSlots = timeSlots.filter(time => {
        const endT = cyberStore.calculateEndTime(time, durationMinutes);
        return cyberStore.isDeviceAvailable(selectedDevice.id, candidateDate.dateStr, time, endT).available;
      });
      if (candidateSlots.length > 0) {
        return {
          dateStr: candidateDate.dateStr,
          label: candidateDate.label,
          dayName: candidateDate.dayName,
          firstSlot: candidateSlots[0],
          slotCount: candidateSlots.length
        };
      }
    }
    return null;
  }, [selectedDevice, availableSlotsOnSelectedDate, dateOptions, selectedDate, durationMinutes, timeSlots]);

  const upcomingDaySummaries = useMemo(() => {
    if (!selectedDevice) return [];
    return dateOptions.slice(0, 7).map(day => {
      const openSlots = timeSlots.filter(time => {
        const endT = cyberStore.calculateEndTime(time, durationMinutes);
        return cyberStore.isDeviceAvailable(selectedDevice.id, day.dateStr, time, endT).available;
      }).length;
      return {
        ...day,
        openSlots,
        isFull: openSlots === 0
      };
    });
  }, [selectedDevice, dateOptions, durationMinutes, timeSlots]);

  // Live Pricing Quote with VIP pass logic & discounts
  const pricingQuote = useMemo(() => {
    if (!selectedDevice) return null;
    try {
      const baseQuote = cyberStore.calculateBookingQuote({
        deviceId: selectedDevice.id,
        date: selectedDate,
        startTime: selectedStartTime,
        durationMinutes,
        promoCode: appliedPromo,
        addons: []
      });

      const stationMultiplier = bookBothStations ? 2 : 1;
      baseQuote.subtotal = baseQuote.subtotal * stationMultiplier;
      baseQuote.totalAmount = baseQuote.totalAmount * stationMultiplier;
      baseQuote.depositRequired = baseQuote.depositRequired * stationMultiplier;
      baseQuote.remainingAmount = baseQuote.remainingAmount * stationMultiplier;

      // Apply VIP Perks if registered
      if (vipPassInfo && vipPassInfo.pass) {
        const isToday = selectedDate === new Date().toISOString().split('T')[0];
        let vipDiscount = 0;
        let finalTotal = baseQuote.subtotal;

        if (isToday && vipPassInfo.dailyAvailableToday) {
          // First 1 hour of primary station is completely FREE (daily allowance)
          const oneHourPrice = selectedDevice.hourlyPrice;
          const remainingHours = Math.max(0, (durationHours * stationMultiplier) - 1);
          
          if (remainingHours === 0) {
            finalTotal = 0;
            vipDiscount = oneHourPrice;
          } else {
            const extraHoursBase = remainingHours * selectedDevice.hourlyPrice;
            const extraDiscount = Math.round((extraHoursBase * vipPassInfo.pass.discountPercent) / 100);
            finalTotal = extraHoursBase - extraDiscount;
            vipDiscount = oneHourPrice + extraDiscount;
          }
        } else {
          // Apply VIP discount percentage to entire booking
          vipDiscount = Math.round((baseQuote.subtotal * vipPassInfo.pass.discountPercent) / 100);
          finalTotal = Math.max(0, baseQuote.subtotal - vipDiscount);
        }

        return {
          ...baseQuote,
          discount: vipDiscount,
          totalAmount: finalTotal,
          isVipApplied: true,
          vipDailyHourUsed: isToday && vipPassInfo.dailyAvailableToday,
          bookBothStations
        };
      }

      return {
        ...baseQuote,
        bookBothStations
      };
    } catch (e: any) {
      return null;
    }
  }, [selectedDevice, selectedDate, selectedStartTime, durationMinutes, appliedPromo, vipPassInfo, bookBothStations]);

  // Promo code apply
  const handleApplyPromo = () => {
    setPromoError('');
    const code = promoCodeInput.trim().toUpperCase();
    if (!code) {
      setAppliedPromo('');
      return;
    }
    const promos = cyberStore.getPromoCodes();
    const match = promos.find(p => p.code.toUpperCase() === code && p.active);
    if (!match) {
      setPromoError('Invalid or expired promo code');
      return;
    }
    setAppliedPromo(code);
  };

  // Submit booking
  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError('');

    if (!selectedDevice) {
      setBookingError('Please choose a PlayStation 5 station.');
      return;
    }

    if (!customerName.trim()) {
      setBookingError('Please enter your full name.');
      return;
    }

    const cleanPhone = customerPhone.trim();
    if (!cleanPhone || cleanPhone.length < 9) {
      setBookingError('Please enter a valid mobile number (e.g. 01712345678).');
      return;
    }

    if (!currentSlotAvailability.available) {
      setBookingError(currentSlotAvailability.reason || 'Selected 1-hour slot is not available. Please choose another time or switch to the next available day.');
      return;
    }

    if (bookBothStations && otherDevice) {
      const otherCheck = cyberStore.isDeviceAvailable(otherDevice.id, selectedDate, selectedStartTime, calculatedEndTime);
      if (!otherCheck.available) {
        setBookingError(`Second station (${otherDevice.name}) is not available at ${selectedStartTime}. Please choose a time when both stations are open.`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const fullNotes = [
        customerNotes.trim(),
        bookBothStations ? 'DUAL-STATION BOOKING (Stations A & B)' : ''
      ].filter(Boolean).join(' | ');

      // 1. Create primary station booking
      const booking = cyberStore.createBooking({
        deviceId: selectedDevice.id,
        date: selectedDate,
        startTime: selectedStartTime,
        durationMinutes,
        customerName: bookBothStations ? `${customerName} (Station 1)` : customerName,
        customerPhone: cleanPhone,
        customerEmail,
        playersCount: 1,
        addons: [],
        promoCode: appliedPromo,
        notes: fullNotes,
        paymentMethod
      });

      // 2. If dual-station requested, also reserve second station simultaneously
      if (bookBothStations && otherDevice) {
        cyberStore.createBooking({
          deviceId: otherDevice.id,
          date: selectedDate,
          startTime: selectedStartTime,
          durationMinutes,
          customerName: `${customerName} (Station 2)`,
          customerPhone: cleanPhone,
          customerEmail,
          playersCount: 1,
          addons: [],
          promoCode: appliedPromo,
          notes: `DUAL-STATION PAIRED WITH ${booking.id} | ${fullNotes}`,
          paymentMethod
        });
      }

      // If VIP Pass applied, adjust amount
      if (pricingQuote && (pricingQuote as any).isVipApplied) {
        booking.totalAmount = pricingQuote.totalAmount;
      }

      // 3. Persist to Cloud SQL backend
      await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: booking.id,
          deviceId: booking.deviceId,
          date: booking.date,
          startTime: booking.startTime,
          endTime: booking.endTime,
          durationMinutes: booking.durationMinutes,
          customerName: booking.customerName,
          customerPhone: booking.customerPhone,
          customerEmail: booking.customerEmail || '',
          playersCount: booking.playersCount,
          totalAmount: booking.totalAmount,
          deposit: booking.deposit,
          paymentMethod: booking.paymentMethod,
          paymentStatus: booking.paymentStatus,
          status: booking.status,
          accessCode: booking.accessCode,
          qrCodeData: booking.qrCodeData,
          isVip: Boolean(vipPassInfo?.pass),
          vipPassId: vipPassInfo?.pass?.id || null,
          notes: booking.notes || ''
        })
      }).catch(console.error);

      // Celebration confetti
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {}

      setConfirmedBooking(booking);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setIsSubmitting(false);
      setBookingError(err.message || 'Failed to complete reservation. Please try again.');
    }
  };

  const copyAccessCode = () => {
    if (!confirmedBooking) return;
    const textToCopy = `CyberCraze Lounge Pass\nStation: ${confirmedBooking.deviceName}\nDate: ${confirmedBooking.date}\nTime: ${confirmedBooking.startTime} - ${confirmedBooking.endTime}\nBooking ID: ${confirmedBooking.id}\nAccess Code: ${confirmedBooking.accessCode}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // -------------------------------------------------------------
  // CONFIRMATION SCREEN (TICKET PASS)
  // -------------------------------------------------------------
  if (confirmedBooking) {
    return (
      <div className="min-h-screen bg-[#0a0d14] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto bg-[#101624] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-1">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
              Reservation Confirmed · Cloud SQL Registered
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              You’re All Set to Play!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              Arrive 10 minutes prior to match time at Akua Hazibari, Mymensingh. Show your QR pass at the desk. All games included free!
            </p>
          </div>

          <div className="my-6 p-5 bg-[#0a0d14] border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center gap-6 justify-between">
            <div className="text-center sm:text-left space-y-2">
              <div className="text-xs text-slate-400 font-medium">Booking ID</div>
              <div className="font-mono text-xl sm:text-2xl font-bold text-blue-400 tracking-wider">
                {confirmedBooking.id}
              </div>
              <div className="text-xs text-slate-300">
                Access Code: <span className="font-mono text-white font-semibold">{confirmedBooking.accessCode}</span>
              </div>
              <div className="text-xs text-slate-400">
                Phone: {confirmedBooking.customerPhone}
              </div>
              <button
                onClick={copyAccessCode}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied to Clipboard' : 'Copy Pass ID & Code'}</span>
              </button>
            </div>

            <div className="flex flex-col items-center">
              <CyberQRCode 
                value={confirmedBooking.qrCodeData} 
                size={140} 
                downloadFilename={`cybercraze-checkin-${confirmedBooking.id.toLowerCase()}`}
                showDownloadButton={true}
              />
              <span className="text-[11px] text-slate-400 mt-2 font-medium">
                Counter Scan Code
              </span>
            </div>
          </div>

          <div className="space-y-3 py-4 border-t border-b border-slate-800 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Station</span>
              <span className="text-white font-semibold">{confirmedBooking.deviceName} ({confirmedBooking.deviceCode})</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Date</span>
              <span className="text-slate-200">{confirmedBooking.date}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">1-Hour Session Slot</span>
              <span className="text-blue-400 font-semibold">{formatTime12h(confirmedBooking.startTime)} – {formatTime12h(confirmedBooking.endTime)} ({confirmedBooking.durationMinutes / 60} hr)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Games Included</span>
              <span className="text-emerald-400 font-medium">All PS5 Titles Free (Switch & Play Any Game)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Reserved For</span>
              <span className="text-slate-200">{confirmedBooking.customerName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Total Rate</span>
              <span className="text-white font-bold text-sm tabular-nums">৳{confirmedBooking.totalAmount}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Payment Status</span>
              <span className="text-emerald-400 font-medium">
                {confirmedBooking.totalAmount === 0 ? 'Covered by VIP Daily Pass' : confirmedBooking.deposit > 0 ? `৳${confirmedBooking.deposit} Paid via bKash` : 'Pay at Counter'}
              </span>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => window.print()}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print or Save Pass</span>
            </button>
            <button
              onClick={() => navigate(`/booking/${confirmedBooking.id}`)}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg shadow-subtle flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Manage Booking</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setConfirmedBooking(null)}
              className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg text-xs font-medium cursor-pointer"
            >
              Book Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // MAIN BOOKING FORM
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Title & Navigation */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
              <span>Direct Guest Reservation</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400 font-normal lowercase">no login required</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              Book a PlayStation 5 Station
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Discrete 1-hour sessions (10 to 11, 14 to 15, etc.). Play any game during your hour!
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/membership')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 py-2 px-3.5 bg-amber-950/40 border border-amber-800/40 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Get VIP Pass (1 Hr Free Daily)</span>
            </button>
            <button
              onClick={() => navigate('/booking/manage')}
              className="text-xs font-medium text-slate-400 hover:text-white py-2 px-3.5 bg-slate-900 border border-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Lookup Pass →
            </button>
          </div>
        </div>

        {/* Free Game Library Notice */}
        <div className="mb-6 p-4 sm:p-5 bg-blue-950/30 border border-blue-800/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3 text-blue-300">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Gamepad2 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <strong className="text-white text-sm block">All Games Included Free – Play Any Game You Want!</strong>
              <span className="text-slate-300">
                No need to pick a game in advance. During your 1-hour session (e.g. 10:00–11:00 or 15:00–16:00), switch between FC 25, Tekken 8, Spider-Man 2, GTA V, Mortal Kombat 1, WWE 2K24 & 50+ PS Plus Deluxe titles anytime free!
              </span>
            </div>
          </div>
          <div className="shrink-0 text-emerald-400 font-semibold bg-emerald-950/60 px-3.5 py-1.5 rounded-lg border border-emerald-800/40 self-start sm:self-auto flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>100% Free Game Switching</span>
          </div>
        </div>

        {bookingError && (
          <div className="mb-6 p-4 bg-rose-950/40 border border-rose-800/60 rounded-xl flex items-center gap-3 text-rose-300 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{bookingError}</span>
          </div>
        )}

        <form onSubmit={handleConfirmBooking} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: SELECTION WIZARD (8 COLS) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* STEP 1: CHOOSE PS5 STATION */}
            <div className="bg-[#101624] border border-slate-800 rounded-xl p-5 sm:p-6 shadow-card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 text-xs flex items-center justify-center font-bold">1</span>
                  Select PlayStation 5 Battlestation
                </h3>
                <span className="text-xs text-blue-400 bg-blue-950/50 border border-blue-800/30 px-2.5 py-1 rounded-full self-start sm:self-auto">
                  Currently 2 Flagship PS5 Stations Active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {devices.map((dev) => {
                  const isSelected = selectedDeviceId === dev.id || bookBothStations;

                  return (
                    <div
                      key={dev.id}
                      onClick={() => {
                        setSelectedDeviceId(dev.id);
                        if (bookBothStations) setBookBothStations(false);
                      }}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-blue-600/10 border-blue-500 shadow-sm'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs text-blue-400">{dev.code}</span>
                              <span className="text-xs text-white font-semibold">{dev.name}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{dev.zone}</div>
                          </div>
                          <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Live Station
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                          {dev.description}
                        </p>

                        <div className="text-[11px] text-slate-400 space-y-1 mb-3 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Screen:</span>
                            <span className="text-slate-200 font-medium">{dev.display}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Controllers:</span>
                            <span className="text-slate-200 font-medium">2x DualSense (up to 4 supported)</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Game Access:</span>
                            <span className="text-emerald-400 font-medium">All PS5 Titles Free</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
                        <div className="font-bold text-white tabular-nums">
                          ৳{dev.hourlyPrice} <span className="text-[11px] text-slate-400 font-normal">/ 1 hour</span>
                        </div>
                        <span className="text-[11px] text-blue-400 font-semibold">
                          {isSelected ? '✓ Station Selected' : 'Click to Select'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* BOOK BOTH STATIONS SIMULTANEOUSLY OPTION */}
              {devices.length >= 2 && (
                <div className="mt-4 p-3.5 bg-gradient-to-r from-blue-950/60 via-purple-950/40 to-slate-900 border border-blue-500/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                      <Gamepad2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>Book Both PS5 Stations at the Same Time</span>
                        <span className="text-[10px] bg-blue-500 text-white font-extrabold px-1.5 py-0.2 rounded uppercase">
                          Tournament / Group
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Reserve PS5 Station Alpha & Beta side-by-side for 2v2 tournaments, parties, or friend groups!
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBookBothStations(!bookBothStations)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                      bookBothStations
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {bookBothStations ? '✓ Both Stations Selected' : 'Book Both Stations'}
                  </button>
                </div>
              )}
            </div>

            {/* STEP 2: DATE, DURATION & DISCRETE 1-HOUR TIME SLOTS */}
            <div className="bg-[#101624] border border-slate-800 rounded-xl p-5 sm:p-6 shadow-card space-y-6">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 text-xs flex items-center justify-center font-bold">2</span>
                Choose Date, 1-Hour Multiple & Start Slot
              </h3>

              {/* Quick Day Availability Strip */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-slate-300">
                    Session Date
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Showing next 7 days for {selectedDevice?.code}
                  </span>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {upcomingDaySummaries.map((opt) => (
                    <button
                      key={opt.dateStr}
                      type="button"
                      onClick={() => {
                        setSelectedDate(opt.dateStr);
                        const firstOpen = timeSlots.find(t => {
                          const endT = cyberStore.calculateEndTime(t, durationMinutes);
                          return cyberStore.isDeviceAvailable(selectedDevice.id, opt.dateStr, t, endT).available;
                        });
                        if (firstOpen) {
                          setSelectedStartTime(firstOpen);
                        }
                      }}
                      className={`px-3 py-2 rounded-xl border text-center transition-all shrink-0 min-w-[95px] cursor-pointer flex flex-col items-center justify-between ${
                        selectedDate === opt.dateStr
                          ? 'bg-blue-600 text-white border-blue-500 font-semibold shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-[10px] uppercase tracking-wider opacity-80">{opt.dayName}</div>
                      <div className="text-xs font-bold mt-0.5">{opt.label}</div>
                      <div className="mt-1.5">
                        {opt.isFull ? (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                            selectedDate === opt.dateStr ? 'bg-black/30 text-rose-200' : 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                          }`}>
                            Full
                          </span>
                        ) : (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            selectedDate === opt.dateStr ? 'bg-black/30 text-emerald-200' : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                          }`}>
                            {opt.openSlots} Open
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration: 1 to 4 Hours (Discrete 1-hour sessions, NO 30 mins) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-slate-300">
                    Duration (Discrete 1-Hour Blocks)
                  </label>
                  <span className="text-xs text-blue-400 font-medium">
                    {durationHours} Hour{durationHours > 1 ? 's' : ''} ({durationMinutes} mins)
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((hours) => (
                    <button
                      key={hours}
                      type="button"
                      onClick={() => setDurationHours(hours)}
                      className={`py-2.5 px-2 text-center text-xs rounded-xl border transition-all cursor-pointer ${
                        durationHours === hours
                          ? 'bg-blue-600 text-white border-blue-500 font-bold shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 font-medium'
                      }`}
                    >
                      <div>{hours} Hour{hours > 1 ? 's' : ''}</div>
                      <div className={`text-[10px] mt-0.5 ${durationHours === hours ? 'text-blue-100' : 'text-slate-500'}`}>
                        {hours === 1 ? 'Standard' : hours === 2 ? 'Co-op' : hours === 3 ? 'Marathon' : 'Grind'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Next Available Day Banner */}
              {availableSlotsOnSelectedDate.length === 0 && (
                <div className="p-4 bg-amber-950/30 border border-amber-800/50 rounded-xl space-y-3">
                  <div className="flex items-start gap-2.5 text-amber-300 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                    <div>
                      <strong className="block text-amber-200">
                        No 1-hour slots available on {dateOptions.find(d => d.dateStr === selectedDate)?.label || selectedDate} for {selectedDevice?.code}.
                      </strong>
                      <span className="text-amber-300/80">
                        All sessions are booked for this station. Switch to the next available date or check the other PS5 station!
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-amber-800/40">
                    {nextAvailableDateInfo && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDate(nextAvailableDateInfo.dateStr);
                          setSelectedStartTime(nextAvailableDateInfo.firstSlot);
                          setSwitchFlash(true);
                          setTimeout(() => setSwitchFlash(false), 1500);
                        }}
                        className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                      >
                        <CalendarCheck2 className="w-4 h-4" />
                        <span>Book Next Day: {nextAvailableDateInfo.label} ({nextAvailableDateInfo.firstSlot})</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {otherDevice && otherDeviceSlotsOnSelectedDate.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDeviceId(otherDevice.id);
                          setSelectedStartTime(otherDeviceSlotsOnSelectedDate[0]);
                          setSwitchFlash(true);
                          setTimeout(() => setSwitchFlash(false), 1500);
                        }}
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <RotateCw className="w-3.5 h-3.5 text-blue-400" />
                        <span>Switch to {otherDevice.code} ({otherDeviceSlotsOnSelectedDate.length} open today)</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* 1-Hour Time Slots Grid */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-slate-300">
                    Select 1-Hour Match Slot (e.g. 10 to 11, 14 to 15)
                  </label>
                  <span className="text-xs text-blue-400">
                    Session: <strong className="font-mono text-white">{formatTime12h(selectedStartTime)} – {formatTime12h(calculatedEndTime)}</strong>
                  </span>
                </div>

                <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 p-2.5 border border-slate-800 rounded-xl bg-slate-950/60 transition-all ${
                  switchFlash ? 'ring-2 ring-emerald-500' : ''
                }`}>
                  {timeSlots.map((time) => {
                    const isSelected = selectedStartTime === time;
                    const endT = cyberStore.calculateEndTime(time, durationMinutes);
                    const slotCheck = selectedDevice 
                      ? cyberStore.isDeviceAvailable(selectedDevice.id, selectedDate, time, endT) 
                      : { available: false, reason: 'Select a station' };
                    const isSlotFree = slotCheck.available;

                    return (
                      <button
                        key={time}
                        type="button"
                        disabled={!isSlotFree}
                        onClick={() => setSelectedStartTime(time)}
                        className={`p-2.5 text-center rounded-xl border transition-all flex flex-col items-center justify-center ${
                          !isSlotFree
                            ? 'bg-slate-950/40 border-slate-900/60 text-slate-600 cursor-not-allowed line-through'
                            : isSelected
                            ? 'bg-blue-600 text-white border-blue-500 shadow-md font-bold'
                            : 'bg-slate-900/80 border-slate-800/80 text-slate-200 hover:border-slate-700 hover:bg-slate-800 cursor-pointer'
                        }`}
                      >
                        <div className="font-mono text-xs tracking-tight font-semibold">
                          {formatTime12h(time)} – {formatTime12h(endT)}
                        </div>
                        <div className="text-[10px] mt-1 flex items-center gap-1 font-sans">
                          {isSlotFree ? (
                            <span className={isSelected ? 'text-blue-100 font-medium' : 'text-emerald-400'}>
                              {isSelected ? '✓ Selected' : 'Available'}
                            </span>
                          ) : (
                            <span className="text-rose-500/80 font-normal">Booked</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* STEP 3: GUEST INFORMATION & VIP DETECTION */}
            <div className="bg-[#101624] border border-slate-800 rounded-xl p-5 sm:p-6 shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 text-xs flex items-center justify-center font-bold">3</span>
                  Guest Information & VIP Recognition
                </h3>
                <span className="text-[11px] text-slate-400">
                  Instant SMS & QR Pass Confirmation
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Mobile Phone Number <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 01712345678"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  {isCheckingVip && (
                    <div className="text-[10px] text-slate-400 mt-1">Checking VIP database...</div>
                  )}
                </div>
              </div>

              {/* VIP Member Recognition Banner */}
              {vipPassInfo && (
                <div className="p-4 bg-amber-950/30 border border-amber-500/40 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span>VIP Member Recognized: {vipPassInfo.pass.customerName} ({vipPassInfo.pass.tier.replace('_', ' ')})</span>
                  </div>
                  <div className="text-xs text-slate-200">
                    {vipPassInfo.dailyAvailableToday ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        1 Free Hour Available Today! Applied automatically to your reservation.
                      </span>
                    ) : (
                      <span className="text-amber-300">
                        Today's free 1-hour session was already used. Applying your {vipPassInfo.pass.discountPercent}% VIP discount to this session!
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="e.g. tanvir@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Special Notes / Requests (Optional)
                </label>
                <input
                  type="text"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="e.g. Coming for FC 25 tournament, need extra dualsense controllers"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

          </div>

          {/* RIGHT: LIVE BOOKING SUMMARY CARD (4 COLS) */}
          <div className="lg:col-span-4">
            <div className="sticky top-20 bg-[#101624] border border-slate-800 rounded-xl p-5 sm:p-6 shadow-card space-y-5">
              
              <div>
                <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                  Reservation Quote
                </div>
                <h3 className="font-bold text-lg text-white mt-0.5">
                  Session Summary
                </h3>
              </div>

              {/* Station Snapshot */}
              <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Station:</span>
                  <span className="font-bold text-white">{selectedDevice?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Date:</span>
                  <span className="font-medium text-slate-200">{selectedDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Time Slot:</span>
                  <span className="font-semibold text-blue-400 font-mono">
                    {formatTime12h(selectedStartTime)} – {formatTime12h(calculatedEndTime)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Duration:</span>
                  <span className="font-medium text-slate-200">{durationHours} Hour{durationHours > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Game Access:</span>
                  <span className="font-semibold text-emerald-400">All PS5 Games Free</span>
                </div>
              </div>

              {/* Promo Code Input */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Have a Promo Code?
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                    placeholder="e.g. CYBER10"
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {appliedPromo && (
                  <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                    <Check className="w-3.5 h-3.5" />
                    <span>Promo {appliedPromo} applied!</span>
                  </div>
                )}
                {promoError && (
                  <div className="text-[11px] text-rose-400 mt-1">
                    {promoError}
                  </div>
                )}
              </div>

              {/* Price Calculation */}
              {pricingQuote && (
                <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Base Rate ({durationHours} hr{durationHours > 1 ? 's' : ''}):</span>
                    <span className="tabular-nums">৳{pricingQuote.subtotal}</span>
                  </div>

                  {pricingQuote.discount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-semibold">
                      <span>{vipPassInfo ? 'VIP Member Discount / Allowance:' : 'Promo Discount:'}</span>
                      <span className="tabular-nums">-৳{pricingQuote.discount}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                    <span className="text-white font-bold text-sm">Total Due:</span>
                    <span className="text-2xl font-extrabold text-blue-400 tabular-nums">
                      {pricingQuote.totalAmount === 0 ? 'FREE (VIP)' : `৳${pricingQuote.totalAmount}`}
                    </span>
                  </div>
                </div>
              )}

              {/* Payment Method */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="block text-xs font-medium text-slate-300">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('BKASH')}
                    className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                      paymentMethod === 'BKASH'
                        ? 'bg-blue-600/10 border-blue-500 text-white font-semibold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-pink-400">bKash</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Pay & confirm now</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CASH')}
                    className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                      paymentMethod === 'CASH'
                        ? 'bg-blue-600/10 border-blue-500 text-white font-semibold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-emerald-400">Pay at Counter</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Cash upon arrival</div>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !currentSlotAvailability.available}
                className={`w-full py-3.5 rounded-xl font-bold text-xs transition-all shadow-subtle flex items-center justify-center gap-2 cursor-pointer ${
                  !currentSlotAvailability.available
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-card-hover'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Registering Booking in Cloud SQL...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirm 1-Hour Booking</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-[11px] text-slate-500 text-center leading-normal">
                Past-day bookings are automatically cleaned from the database. Free cancellation available up to 2 hours before match time.
              </div>

            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
