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
  ArrowRight, 
  ShieldAlert, 
  Sparkles,
  Camera,
  CameraOff,
  Gamepad2,
  Tv
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminCheckInModal: React.FC<Props> = ({ isOpen, onClose }) => {
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

  // Stop camera helper defined first
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
    if (isOpen) {
      const devs = cyberStore.getDevices();
      setDevices(devs);
      const firstAvailable = devs.find(d => d.status === 'AVAILABLE');
      if (firstAvailable) {
        setSelectedStationForVip(firstAvailable.id);
      } else if (devs.length > 0) {
        setSelectedStationForVip(devs[0].id);
      }
    }
  }, [isOpen]);

  // Clean up camera on modal close
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
    }
  }, [isOpen, stopCamera]);

  if (!isOpen) return null;

  // Live video frame processing with jsQR
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

  // Toggle Camera
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

  // Instant Recognition Logic (Auto-runs as user types, pastes, or scans from 2D barcode reader)
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

    // Check if input is a JSON string from a scanned VIP QR Code
    if (clean.startsWith('{')) {
      try {
        const parsed = JSON.parse(clean);
        clean = parsed.phone || parsed.customerPhone || parsed.passCode || parsed.id || clean;
      } catch (err) {}
    }

    // Check if colon separated (e.g. CC-2026-000121:748291:01712345678)
    let searchBookingId = clean;
    let searchPhone = clean;
    if (clean.includes(':')) {
      const parts = clean.split(':');
      searchBookingId = parts[0].trim();
      if (parts.length > 2) {
        searchPhone = parts[2].trim();
      }
    }

    const cleanUpper = searchBookingId.toUpperCase();
    const digitsOnly = clean.replace(/[\s-]/g, '');

    // 1. Search Bookings in CyberStore
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

    // 2. Search VIP Passes via Cloud SQL Backend API
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
    } catch (err) {
      // Pass lookup error
    }
    setIsRecognizing(false);
  };

  // Handle Input Changes with Instant Auto-Recognition
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQueryInput(val);

    // If input looks like a scanned QR payload, booking ID, or full phone, trigger immediately
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

  // Start Session for Booking
  const handleCheckInAndStartBooking = async () => {
    if (!foundBooking) return;

    // Call local store & backend
    const res = cyberStore.checkInAndStartSession(foundBooking.id);
    if (res.success) {
      // Also register in backend sessions
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
        onClose();
        setFoundBooking(null);
        setQueryInput('');
      }, 2000);
    } else {
      setErrorMsg(res.message);
    }
  };

  // Start Session for VIP Pass
  const handleStartVipSessionNow = async () => {
    if (!foundVipPass) return;
    const { pass, dailyAvailableToday } = foundVipPass;

    try {
      const res = await fetch('/api/sessions/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: selectedStationForVip,
          vipPassId: pass.id,
          customerName: pass.customerName,
          customerPhone: pass.customerPhone,
          durationMinutes: 60 // 1 hour
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to launch VIP session');
      }

      // Also create active session in cyberStore for live UI sync
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
        onClose();
        setFoundVipPass(null);
        setQueryInput('');
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error starting session');
    }
  };

  // Advance Scheduling for VIP Pass
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
      onClose();
      setFoundVipPass(null);
      setIsSchedulingAdvance(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#101624] border border-blue-500/40 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-base text-white">Instant QR & Counter Scanner</h3>
          </div>
          <button onClick={() => { stopCamera(); onClose(); }} className="text-slate-400 hover:text-white text-xs cursor-pointer">
            ✕ Close
          </button>
        </div>

        {/* Camera Scanner Toggle */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Scan via Counter Camera or Hardware Barcode:</span>
            <button
              type="button"
              onClick={toggleCamera}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 cursor-pointer transition-colors ${
                isCameraActive 
                  ? 'bg-rose-950 text-rose-300 border border-rose-800' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              {isCameraActive ? <CameraOff className="w-3.5 h-3.5" /> : <Camera className="w-3.5 h-3.5" />}
              <span>{isCameraActive ? 'Turn Off Camera' : 'Open Camera Scanner'}</span>
            </button>
          </div>

          {/* Camera Viewfinder */}
          {isCameraActive && (
            <div className="relative rounded-xl overflow-hidden border-2 border-dashed border-blue-500 bg-black aspect-video flex items-center justify-center">
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
              <div className="absolute inset-0 border-2 border-blue-400/50 m-6 rounded-lg pointer-events-none flex items-center justify-center">
                <div className="w-full h-0.5 bg-blue-400 animate-pulse shadow-[0_0_10px_#60a5fa]"></div>
              </div>
              <div className="absolute bottom-2 text-[10px] text-white/80 bg-black/60 px-2 py-0.5 rounded">
                Point camera directly at customer's QR Pass
              </div>
            </div>
          )}
        </div>

        {/* Search Bar with Instant Detection */}
        <form onSubmit={handleManualSearch} className="space-y-2">
          <label className="block text-xs font-medium text-slate-300">
            Scan QR Code, Booking ID, Pass Code, or Phone Number:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              autoFocus
              value={queryInput}
              onChange={handleInputChange}
              placeholder="Scan QR payload, enter CC-2026-..., or phone"
              className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isRecognizing}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              {isRecognizing ? 'Checking...' : 'Verify'}
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            ⚡ Instant Recognition: Auto-detects QR codes & registered phone numbers immediately as scanned.
          </p>
        </form>

        {errorMsg && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {statusMsg && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* 1. FOUND REGULAR BOOKING */}
        {foundBooking && (
          <div className="p-4 bg-[#0a0d14] border border-blue-500/40 rounded-xl space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-1.5">
                <Gamepad2 className="w-4 h-4 text-blue-400" />
                <span className="font-mono font-bold text-blue-400">{foundBooking.id}</span>
              </div>
              <span className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                foundBooking.status === 'CONFIRMED' ? 'bg-blue-950 text-blue-300' : 
                foundBooking.status === 'ACTIVE' ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-900 text-slate-400'
              }`}>
                {foundBooking.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400">Player Name:</span>
                <div className="font-bold text-white text-sm">{foundBooking.customerName}</div>
                <div className="text-[11px] text-slate-400 font-mono">{foundBooking.customerPhone}</div>
              </div>
              <div>
                <span className="text-slate-400">Assigned Station:</span>
                <div className="font-bold text-white text-sm">{foundBooking.deviceName}</div>
                <div className="text-[11px] text-blue-400 font-semibold">{foundBooking.startTime} – {foundBooking.endTime} ({foundBooking.durationMinutes}m)</div>
              </div>
            </div>

            <div className="p-2.5 bg-slate-900/80 rounded-lg text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-400">Amount Due at Counter: </span>
                <span className="font-bold text-emerald-400 text-sm">৳{foundBooking.totalAmount - (foundBooking.deposit || 0)}</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Payment: <span className="font-semibold text-slate-200">{foundBooking.paymentMethod}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-[11px] text-amber-400/90 font-medium">
                ⏳ Timer starts immediately on check-in. Player must vacate when time reaches 00:00.
              </span>
              <button
                onClick={handleCheckInAndStartBooking}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Start Session & Launch Timer</span>
              </button>
            </div>
          </div>
        )}

        {/* 2. FOUND VIP PASS */}
        {foundVipPass && (
          <div className="p-5 bg-[#0a0d14] border border-amber-500/50 rounded-xl space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-xs text-amber-400 uppercase tracking-wide">
                  VIP Member Recognized
                </span>
              </div>
              <span className="font-mono text-xs text-amber-300 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                {foundVipPass.pass.passCode}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400">Member Name:</span>
                <div className="font-bold text-white text-sm mt-0.5">{foundVipPass.pass.customerName}</div>
                <div className="text-[11px] text-slate-400 font-mono">{foundVipPass.pass.customerPhone}</div>
              </div>
              <div>
                <span className="text-slate-400">Pass Tier & Validity:</span>
                <div className="font-semibold text-amber-300 mt-0.5">{foundVipPass.pass.tier.replace(/_/g, ' ')}</div>
                <div className="text-[11px] text-slate-400">Valid to: {foundVipPass.pass.expiryDate}</div>
              </div>
            </div>

            <div className="p-3 bg-slate-900 rounded-lg text-xs space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Today's Daily 1-Hour Allowance:</span>
                <span className={`font-semibold ${foundVipPass.dailyAvailableToday ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {foundVipPass.dailyAvailableToday ? '✓ 1 Hour Available Free' : 'Consumed Today'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Extra Bookings Discount:</span>
                <span className="text-blue-400 font-semibold">{foundVipPass.pass.discountPercent}% Off Total</span>
              </div>
            </div>

            {/* Station selector from full cafe fleet */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Assign Station for VIP:
              </label>
              <select
                value={selectedStationForVip}
                onChange={(e) => setSelectedStationForVip(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
              >
                {devices.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.code} – {d.name} ({d.zone}) [{d.status}]
                  </option>
                ))}
              </select>
            </div>

            {/* Actions: Start Now or Schedule Advance */}
            {!isSchedulingAdvance ? (
              <div className="flex gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleStartVipSessionNow}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Start 1-Hr Session Now</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsSchedulingAdvance(true)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Schedule Advance Slot
                </button>
              </div>
            ) : (
              <div className="space-y-3 pt-2 border-t border-slate-800 text-xs">
                <div className="font-semibold text-white">Book Advance Slot for VIP Member:</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Date:</label>
                    <input
                      type="date"
                      value={advanceBookingDate}
                      onChange={(e) => setAdvanceBookingDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Time Slot:</label>
                    <select
                      value={advanceBookingTime}
                      onChange={(e) => setAdvanceBookingTime(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
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
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs cursor-pointer shadow-md"
                  >
                    Confirm Advance Slot
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSchedulingAdvance(false)}
                    className="px-3 py-2.5 bg-slate-800 text-slate-400 hover:text-white rounded-lg text-xs cursor-pointer"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

