import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [sent, setSent] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setFormData({ name: '', phone: '', message: '' });
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
            Frontdesk & Support
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
            Get in Touch with CyberCraze
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2">
            Have questions about setup specs, private squad bookings, or clan tournaments? Visit us at Akua Hazibari or message our frontdesk team directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Direct Info (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#101624] border border-slate-800 rounded-2xl p-6 space-y-6 shadow-card">
              <h3 className="font-bold text-base text-white border-b border-slate-800 pb-3">
                Location & Frontdesk
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block text-sm">CyberCraze – HQ Gaming Space</strong>
                    <span className="text-slate-300">
                      Akua Hazibari – Shadar,<br />
                      Mymensingh, Bangladesh
                    </span>
                    <div className="text-[11px] text-slate-500 mt-1">Near Hazibari Lane & Akua Main Road</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="text-slate-300">+880 1712-345678</span>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="text-slate-300">contact@cybercraze.gg</span>
                </div>

                <div className="flex items-start gap-3 pt-2 border-t border-slate-800">
                  <Clock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="text-white font-semibold">Operating Hours</div>
                    <div className="text-slate-300">Saturday – Thursday: 10:00 AM – 11:00 PM</div>
                    <div className="text-slate-400">Friday (Jummah): 02:00 PM – 11:30 PM</div>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp Callout */}
              <div className="pt-2">
                <a
                  href="https://wa.me/8801712345678"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-800/60 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat on WhatsApp Frontdesk</span>
                </a>
              </div>
            </div>

            {/* Quick Map Directions Card */}
            <div className="bg-[#101624] border border-slate-800 rounded-2xl p-5 text-center space-y-2 shadow-card">
              <div className="font-bold text-sm text-white">Google Maps Navigation</div>
              <p className="text-xs text-slate-400">Direct directions to our entrance at Akua Hazibari.</p>
              <a
                href="https://maps.google.com/?q=Akua+Hazibari+Mymensingh"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg transition-colors mt-2"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Right Column: Direct Message Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-[#101624] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-card">
              <div>
                <h3 className="font-bold text-lg text-white">Send a Direct Message</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Our shift manager usually responds within 15 minutes during operating hours.
                </p>
              </div>

              {sent ? (
                <div className="p-6 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <div className="font-bold text-sm text-white">Message Dispatched</div>
                  <p className="text-xs text-slate-300">
                    Thank you! Our frontdesk team at Akua Hazibari will call or WhatsApp you shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Mahim Rahman"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Mobile Number (WhatsApp)
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. 01712345678"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Message or Inquiry Details
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Ask about private squad lockouts, custom simulator setups, or birthday tournaments..."
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg shadow-subtle transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Message to Frontdesk</span>
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
