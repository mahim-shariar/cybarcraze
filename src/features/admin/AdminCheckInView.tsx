import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { cyberStore } from '../../lib/cyberStore';
import { Booking, Device } from '../../types';
import {
  QrCode,
  Search,
  CheckCircle2,
  AlertTriangle,
  Play,
  Crown,
  Clock,
  Calendar,
  Camera,
  CameraOff,
  Gamepad2,
  Tv,
  Sparkles
} from 'lucide-react';

interface Props {
  navigate?: (path: string) => void;
}

export const AdminCheckInView: React.FC<Props> = () => {
  const [queryInput, setQueryInput] = useState('');
  const [foundBooking, setFoundBooking] = useState<Booking | null>(null);
  const [foundVipPass, setFoundVipPass] = useState<any | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedStationForVip, setSelectedStationForVip] = useState<string>('dev-ps5-01');
  const [advanceBookingDate, setAdvanceBookingDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [advanceBookingTime, setAdvanceBookingTime] = useState<string>('15:00');
  const [isSchedulingAdvance, setIsSchedulingAdvance] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [isRecognizing, setIsRecognizing] = useState(false);

  // Camera QR Scanner state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scanLoopRef = useRef<number | null>(null);

  const stopCamera = React.useCallback(() => {
    if (scanLoopRef.current) {
      cancelAnimationFrame(scanLoopRef.current);
      scanLoopRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  useEffect(() => {
    const devs = cyberStore.getDevices();
    setDevices(devs);
    const firstAvailable = devs.find(d => d.status === 'AVAILABLE');
    if (firstAvailable) {
      setSelectedStationForVip(firstAvailable.id);
    } else if (devs.length > 0) {
      setSelectedStationForVip(devs[0].id);
    }
  }, []);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const startScanningFrames = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const scanFrame = () => {
      if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
        scanLoopRef.current = requestAnimationFrame(scanFrame);
        return;
      }

      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          const raw = code.data.trim();
          if (raw) {
            setQueryInput(raw);
            performRecognition(raw);
            stopCamera();
            return;
          }
        }
      }

      scanLoopRef.current = requestAnimationFrame(scanFrame);
    };

    scanLoopRef.current = requestAnimationFrame(scanFrame);
  };

  const toggleCamera = async () => {
    if (isCameraActive) {
      stopCamera();
      return;
    }

    try {
      setErrorMsg('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsCameraActive(true);
        startScanningFrames();
      }
    } catch (err: any) {
      setErrorMsg('Could not open camera. Please use manual QR input or barcode scanner.');
      setIsCameraActive(false);
    }
  };

  const performRecognition = async (rawInput: string) => {
    let clean = rawInput.trim();
    if (!clean) {
      setFoundBooking(null);
      setFoundVipPass(null);
      setErrorMsg('');
      return;
    }

    setErrorMsg('');
    setStatusMsg('');

    if (clean.startsWith('{')) {
      try {
        const parsed = JSON.parse(clean);
        clean = parsed.phone || parsed.customerPhone || parsed.passCode || parsed.id || clean;
      } catch (err) {}
    }

    let searchBookingId = clean;
    if (clean.includes(':')) {
      const parts = clean.split(':');
      searchBookingId = parts[0].trim();
    }

    const cleanUpper = searchBookingId.toUpperCase();
    const digitsOnly = clean.replace(/[\s-]/g, '');

    const bookingMatch = cyberStore.getBookings().find(b => 
      b.id.toUpperCase() === cleanUpper || 
      b.accessCode === cleanUpper || 
      b.customerPhone.replace(/[\s-]/g, '') === digitsOnly
    );

    if (bookingMatch) {
      setFoundBooking(bookingMatch);
      setFoundVipPass(null);
      return;
    }

    setIsRecognizing(true);
    try {
      const res = await fetch(`/api/vip-passes/lookup?q=${encodeURIComponent(clean)}`);
      if (res.ok) {
        const vipData = await res.json();
        setFoundVipPass(vipData);
        setFoundBooking(null);
        setIsRecognizing(false);
        return;
      }
    } catch (err) {}
    setIsRecognizing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQueryInput(val);

    if (
      val.length >= 6 ||
      val.startsWith('{') ||
      val.includes(':') ||
      val.toUpperCase().startsWith('CC-') ||
      val.toUpperCase().startsWith('VIP-')
    ) {
      performRecognition(val);
    } else {
      setFoundBooking(null);
      setFoundVipPass(null);
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performRecognition(queryInput);
    if (!foundBooking && !foundVipPass && queryInput.trim()) {
      setErrorMsg('No booking or VIP pass found matching that code or phone number.');
    }
  };

  const handleCheckInAndStartBooking = async () => {
    if (!foundBooking) return;

    const res = cyberStore.checkInAndStartSession(foundBooking.id);
    if (res.success) {
      await fetch('/api/sessions/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: foundBooking.deviceId,
          bookingId: foundBooking.id,
          customerName: foundBooking.customerName,
          customerPhone: foundBooking.customerPhone,
          durationMinutes: foundBooking.durationMinutes
        })
      }).catch(console.error);

      setStatusMsg(`Checked in! Live countdown timer started for ${foundBooking.deviceName}. Player must vacate station when time reaches 00:00.`);
      stopCamera();
      setTimeout(() => {
        setFoundBooking(null);
        setQueryInput('');
      }, 3500);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleStartVipSessionNow = async () => {
    if (!foundVipPass) return;
    const { pass } = foundVipPass;

    try {
      const res = await fetch('/api/sessions/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: selectedStationForVip,
          vipPassId: pass.id,
          customerName: pass.customerName,
          customerPhone: pass.customerPhone,
          durationMinutes: 60
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to launch VIP session');
      }

      const station = cyberStore.getDeviceById(selectedStationForVip);
      cyberStore.startDirectSession({
        deviceId: selectedStationForVip,
        customerName: pass.customerName,
        customerPhone: pass.customerPhone,
        durationMinutes: 60
      });

      setStatusMsg(`VIP Pass Verified! 1-Hour match session launched on ${station?.name || 'PS5'}. Timer is running! Customer must vacate at 00:00.`);
      stopCamera();
      setTimeout(() => {
        setFoundVipPass(null);
        setQueryInput('');
      }, 3500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error starting session');
    }
  };

  const handleScheduleVipAdvance = () => {
    if (!foundVipPass) return;
    const { pass } = foundVipPass;

    const booking = cyberStore.createBooking({
      deviceId: selectedStationForVip,
      date: advanceBookingDate,
      startTime: advanceBookingTime,
      durationMinutes: 60,
      customerName: pass.customerName,
      customerPhone: pass.customerPhone,
      playersCount: 2,
      addons: [],
      notes: 'VIP Pass advance scheduled booking',
      paymentMethod: 'CASH'
    });

    setStatusMsg(`Advance 1-hour session successfully scheduled on ${advanceBookingDate} at ${advanceBookingTime}! Booking ID: ${booking.id}`);
    setTimeout(() => {
      setFoundVipPass(null);
      setIsSchedulingAdvance(false);
    }, 3500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
            Frontdesk Counter Operations
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Counter QR Scanner & Check-In
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Scan player check-in QR codes or enter VIP Member phone numbers to launch match sessions.
          </p>
        </div>

        <button
          type="button"
          onClick={toggleCamera}
          className={`px-4 py-2 rounded-xl font-medium text-xs flex items-center gap-2 cursor-pointer transition-colors ${
            isCameraActive 
              ? 'bg-rose-950 text-rose-300 border border-rose-800' 
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
          }`}
        >
          {isCameraActive ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
          <span>{isCameraActive ? 'Turn Off Counter Camera' : 'Turn On Counter Camera'}</span>
        </button>
      </div>

      {/* Camera Viewfinder */}
      {isCameraActive && (
        <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-blue-500 bg-black max-w-lg mx-auto aspect-video flex items-center justify-center shadow-2xl">
          <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
          <div className="absolute inset-0 border-2 border-blue-400/50 m-8 rounded-xl pointer-events-none flex items-center justify-center">
            <div className="w-full h-0.5 bg-blue-400 animate-pulse shadow-[0_0_12px_#60a5fa]"></div>
          </div>
          <div className="absolute bottom-3 text-xs text-white/90 bg-black/75 px-3 py-1 rounded-full border border-slate-700">
            Align customer's QR pass inside the scanner frame
          </div>
        </div>
      )}

      {/* Search Bar with Instant Detection */}
      <div className="bg-[#101624] border border-slate-800 rounded-2xl p-6 shadow-card space-y-3">
        <form onSubmit={handleManualSearch} className="space-y-2">
          <label className="block text-xs font-semibold text-slate-200">
            Scan QR Code, Booking ID, Pass Code, or Phone Number:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              autoFocus
              value={queryInput}
              onChange={handleInputChange}
              placeholder="Scan QR payload, enter CC-2026-..., or phone"
              className="flex-1 px-4 py-3 bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isRecognizing}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50 shadow-md shrink-0"
            >
              {isRecognizing ? 'Checking...' : 'Verify Pass'}
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            ⚡ Instant Auto-Detection: Recognizes USB 2D hardware barcode scanners, camera QR scans, and phone lookups immediately.
          </p>
        </form>

        {errorMsg && (
          <div className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {statusMsg && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{statusMsg}</span>
          </div>
        )}
      </div>

      {/* 1. FOUND REGULAR BOOKING */}
      {foundBooking && (
        <div className="p-6 bg-[#101624] border border-blue-500/40 rounded-2xl space-y-4 shadow-card animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-blue-400" />
              <span className="font-mono font-bold text-blue-400 text-base">{foundBooking.id}</span>
            </div>
            <span className={`font-semibold px-2.5 py-1 rounded text-xs ${
              foundBooking.status === 'CONFIRMED' ? 'bg-blue-950 text-blue-300 border border-blue-800/40' : 
              foundBooking.status === 'ACTIVE' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40' : 'bg-slate-900 text-slate-400'
            }`}>
              {foundBooking.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400">Player Name:</span>
              <div className="font-bold text-white text-base mt-0.5">{foundBooking.customerName}</div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">{foundBooking.customerPhone}</div>
            </div>
            <div>
              <span className="text-slate-400">Assigned Station:</span>
              <div className="font-bold text-white text-base mt-0.5">{foundBooking.deviceName}</div>
              <div className="text-xs text-blue-400 font-semibold mt-0.5">{foundBooking.startTime} – {foundBooking.endTime} ({foundBooking.durationMinutes}m)</div>
            </div>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-xl text-xs flex items-center justify-between">
            <div>
              <span className="text-slate-400">Amount Due at Counter: </span>
              <span className="font-bold text-emerald-400 text-base ml-1">৳{foundBooking.totalAmount - (foundBooking.deposit || 0)}</span>
            </div>
            <div className="text-xs text-slate-400">
              Payment: <span className="font-semibold text-slate-200">{foundBooking.paymentMethod}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-800">
            <span className="text-xs text-amber-400/90 font-medium">
              ⏳ Timer starts immediately on check-in. Player must vacate when time reaches 00:00.
            </span>
            <button
              onClick={handleCheckInAndStartBooking}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all shrink-0"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Session & Launch Timer</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. FOUND VIP PASS */}
      {foundVipPass && (
        <div className="p-6 bg-[#101624] border border-amber-500/50 rounded-2xl space-y-5 shadow-card animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400" />
              <span className="font-bold text-base text-amber-400">
                VIP Member Recognized
              </span>
            </div>
            <span className="font-mono text-xs text-amber-300 font-bold bg-amber-950/60 px-3 py-1 rounded-lg border border-amber-800/40">
              {foundVipPass.pass.passCode}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400">Member Name:</span>
              <div className="font-bold text-white text-base mt-0.5">{foundVipPass.pass.customerName}</div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">{foundVipPass.pass.customerPhone}</div>
            </div>
            <div>
              <span className="text-slate-400">Pass Tier & Validity:</span>
              <div className="font-semibold text-amber-300 text-sm mt-0.5">{foundVipPass.pass.tier.replace(/_/g, ' ')}</div>
              <div className="text-xs text-slate-400 mt-0.5">Valid to: {foundVipPass.pass.expiryDate}</div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-900 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Daily Free Hour Status (Today):</span>
              <span className={`font-bold px-2 py-0.5 rounded text-xs ${
                foundVipPass.dailyAvailableToday ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
              }`}>
                {foundVipPass.dailyAvailableToday ? '1 Hour Available' : 'Daily Free Hour Already Used'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Extra Bookings Discount:</span>
              <span className="text-blue-400 font-semibold">{foundVipPass.pass.discountPercent}% Off Total</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Assign Station for VIP:
            </label>
            <select
              value={selectedStationForVip}
              onChange={(e) => setSelectedStationForVip(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
            >
              {devices.map(d => (
                <option key={d.id} value={d.id}>
                  {d.code} – {d.name} ({d.zone}) [{d.status}]
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              onClick={handleStartVipSessionNow}
              className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Launch 1-Hour Session Now</span>
            </button>
            <button
              onClick={() => setIsSchedulingAdvance(!isSchedulingAdvance)}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Book Advance Slot
            </button>
          </div>

          {isSchedulingAdvance && (
            <div className="space-y-3 pt-3 border-t border-slate-800 text-xs">
              <div className="font-semibold text-white">Book Advance Slot for VIP Member:</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Date:</label>
                  <input
                    type="date"
                    value={advanceBookingDate}
                    onChange={(e) => setAdvanceBookingDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Time Slot:</label>
                  <select
                    value={advanceBookingTime}
                    onChange={(e) => setAdvanceBookingTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    {['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'].map(t => (
                      <option key={t} value={t}>{t} (1 Hour)</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleScheduleVipAdvance}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md"
                >
                  Confirm Advance Slot
                </button>
                <button
                  type="button"
                  onClick={() => setIsSchedulingAdvance(false)}
                  className="px-4 py-2.5 bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
