import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CyberLogo } from './CyberLogo';

interface Props {
  isLoading: boolean;
}

export const PageLoadingBar: React.FC<Props> = ({ isLoading }) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="fixed inset-0 z-[9999] pointer-events-none flex flex-col justify-between bg-[#0a0d14]/70 backdrop-blur-sm"
        >
          {/* Top Progress Track */}
          <div className="w-full h-1 bg-slate-900 overflow-hidden relative shadow-[0_2px_10px_rgba(59,130,246,0.3)]">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{
                repeat: Infinity,
                duration: 0.75,
                ease: 'easeInOut'
              }}
              className="w-2/3 h-full bg-gradient-to-r from-blue-600 via-sky-400 to-indigo-500 shadow-[0_0_16px_rgba(56,189,248,0.9)]"
            />
          </div>

          {/* Center Luxury Branded Loading Card */}
          <div className="m-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="bg-[#101624]/95 border border-slate-700/80 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 text-center"
            >
              <div className="relative flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
                <div className="absolute w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              </div>

              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-white tracking-wider">CYBERCRAZE</span>
                  <span className="text-[10px] text-blue-400 bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-800/40">LOUNGE</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
                  Switching station floor...
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom spacer */}
          <div className="h-4" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
