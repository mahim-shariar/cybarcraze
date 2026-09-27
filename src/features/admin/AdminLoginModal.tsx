import React, { useState } from 'react';
import { CyberLogo } from '../../components/CyberLogo';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';
import { AdminRole } from './AdminLayout';

export interface StaffAuthSession {
  id: number;
  uid: string;
  email: string;
  displayName: string;
  phone?: string | null;
  role: AdminRole;
}

interface Props {
  onLoginSuccess: (session: StaffAuthSession) => void;
  onCancel: () => void;
}

export const AdminLoginModal: React.FC<Props> = ({ onLoginSuccess, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      const res = await fetch('/api/staff/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Persist auth session in localStorage
      localStorage.setItem('cybercraze_staff_auth', JSON.stringify(data.staff));
      onLoginSuccess(data.staff);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid staff credentials');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = (roleEmail: string, pass: string) => {
    setEmail(roleEmail);
    setPassword(pass);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0f1422] border border-blue-500/40 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <CyberLogo size="sm" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center justify-center gap-2 mt-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <span>Staff & Manager Login</span>
          </h2>
          <p className="text-xs text-slate-400">
            Sign in with authorized staff, manager, or admin credentials.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Staff Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@cybercraze.gg"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Staff Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-2.5 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Authenticate & Enter Console</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-2.5 text-slate-400 hover:text-slate-200 text-xs font-medium cursor-pointer"
            >
              Back to Public Website
            </button>
          </div>
        </form>

        {/* Quick Demo Credentials Pill Shortcuts */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
            Default Demo Credentials
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillQuickDemo('admin@cybercraze.gg', 'admin123')}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 rounded-lg text-left transition-all cursor-pointer"
            >
              <div className="text-[10px] font-bold text-rose-400">Admin</div>
              <div className="text-[9px] text-slate-400 truncate">admin@cyber...</div>
            </button>
            <button
              type="button"
              onClick={() => fillQuickDemo('manager@cybercraze.gg', 'manager123')}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 rounded-lg text-left transition-all cursor-pointer"
            >
              <div className="text-[10px] font-bold text-blue-400">Manager</div>
              <div className="text-[9px] text-slate-400 truncate">manager@cyber...</div>
            </button>
            <button
              type="button"
              onClick={() => fillQuickDemo('staff@cybercraze.gg', 'staff123')}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 rounded-lg text-left transition-all cursor-pointer"
            >
              <div className="text-[10px] font-bold text-emerald-400">Staff</div>
              <div className="text-[9px] text-slate-400 truncate">staff@cyber...</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
