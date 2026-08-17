import React from 'react';
import { Droplets, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#070B13]/90 border-t border-white/[0.06] text-slate-400 py-3 px-4 sm:px-6 lg:px-8 font-sans text-xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
        
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center font-bold">
            <Droplets className="w-3 h-3" />
          </div>
          <span className="font-semibold text-white text-xs tracking-tight">NAWASA Grenada</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 text-[11px]">Customer Support & Utilities Portal</span>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <Phone className="w-3 h-3 text-sky-400" />
            <span>Emergency 276</span>
          </span>
          <span className="text-slate-600">•</span>
          <span>(473) 440-2155</span>
          <span className="text-slate-600">•</span>
          <span>nawasa@nawasa.gd</span>
        </div>

        <div className="text-[10px] text-slate-500 font-mono">
          © {new Date().getFullYear()} National Water & Sewerage Authority
        </div>

      </div>
    </footer>
  );
};
