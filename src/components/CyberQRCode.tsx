import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { Download, Check } from 'lucide-react';

interface Props {
  value: string;
  size?: number;
  className?: string;
  downloadFilename?: string;
  showDownloadButton?: boolean;
  passTitle?: string;
  subtitle?: string;
}

export const CyberQRCode: React.FC<Props> = ({
  value,
  size = 180,
  className = '',
  downloadFilename = 'cybercraze-checkin-code.png',
  showDownloadButton = false,
  passTitle = 'CYBERCRAZE HQ',
  subtitle = 'OFFICIAL CHECK-IN PASS'
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [downloaded, setDownloaded] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!value) return;

    // Generate high resolution QR code data URL with Highest (H) Error Correction
    // so it scans cleanly on any mobile camera or 2D scanner without decoding loss
    QRCode.toDataURL(value, {
      width: Math.max(size * 2, 450),
      margin: 1,
      color: {
        dark: '#05070c',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'H'
    })
      .then((url) => {
        setDataUrl(url);
      })
      .catch((err) => {
        console.error('Failed to generate standard QR code:', err);
      });
  }, [value, size]);

  const handleDownload = () => {
    if (!dataUrl) return;

    // Create a stylized branded check-in badge canvas
    const badgeCanvas = document.createElement('canvas');
    const badgeWidth = 600;
    const badgeHeight = 780;
    badgeCanvas.width = badgeWidth;
    badgeCanvas.height = badgeHeight;
    const ctx = badgeCanvas.getContext('2d');

    if (!ctx) {
      // Fallback: direct download
      const link = document.createElement('a');
      link.download = downloadFilename.endsWith('.png') ? downloadFilename : `${downloadFilename}.png`;
      link.href = dataUrl;
      link.click();
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2500);
      return;
    }

    // 1. Dark Cyber Background
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, badgeWidth, badgeHeight);

    // 2. Cyan Header Glow accent line
    const grad = ctx.createLinearGradient(0, 0, badgeWidth, 0);
    grad.addColorStop(0, '#06b6d4');
    grad.addColorStop(0.5, '#3b82f6');
    grad.addColorStop(1, '#06b6d4');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, badgeWidth, 8);

    // 3. Brand Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(passTitle, badgeWidth / 2, 58);

    ctx.fillStyle = '#06b6d4';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(subtitle, badgeWidth / 2, 86);

    // 4. White QR Container
    const qrBoxSize = 440;
    const qrBoxX = (badgeWidth - qrBoxSize) / 2;
    const qrBoxY = 115;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 20);
    ctx.fill();

    // 5. Draw Pristine QR Code into container (No obscuring center elements)
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.drawImage(img, qrBoxX + 15, qrBoxY + 15, qrBoxSize - 30, qrBoxSize - 30);

      // 6. Footer Instructions & Information
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('Official CyberCraze HQ Pass · Valid for Scanner Check-In', badgeWidth / 2, 595);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 15px monospace';
      ctx.fillText('Akua Hazibari, Mymensingh · 01700-000000', badgeWidth / 2, 625);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px sans-serif';
      ctx.fillText('Save this pass to your phone or print for frontdesk entry', badgeWidth / 2, 660);

      // Trigger download
      const finalUrl = badgeCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = downloadFilename.endsWith('.png') ? downloadFilename : `${downloadFilename}.png`;
      link.href = finalUrl;
      link.click();
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2500);
    };
    img.src = dataUrl;
  };

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      <div className="relative inline-block p-3.5 bg-white rounded-2xl shadow-xl border border-cyan-400/40">
        {dataUrl ? (
          <img
            src={dataUrl}
            alt="Check-In QR Code"
            width={size}
            height={size}
            className="block rounded-lg"
          />
        ) : (
          <div
            style={{ width: size, height: size }}
            className="flex items-center justify-center bg-slate-100 text-slate-400 text-xs rounded-lg animate-pulse"
          >
            Generating QR...
          </div>
        )}
      </div>

      {showDownloadButton && dataUrl && (
        <button
          type="button"
          onClick={handleDownload}
          className="mt-3.5 inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/35 transition-all cursor-pointer group active:scale-95"
        >
          {downloaded ? (
            <>
              <Check className="w-4 h-4 text-emerald-200" />
              <span>QR Code Saved!</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 text-white group-hover:translate-y-0.5 transition-transform" />
              <span>Download Check-In QR</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

