import React, { useState } from 'react';
import { Phone, Search, Radio } from 'lucide-react';

interface HeroBannerProps {
  onSearchBill: (accountNumber: string) => void;
  onSelectTab: (tab: 'chat' | 'bills' | 'outages' | 'calculator') => void;
  onOpenLeakModal: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onSearchBill, onSelectTab }) => {
  const [quickInput, setQuickInput] = useState('');

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickInput.trim()) {
      onSearchBill(quickInput.trim());
      onSelectTab('bills');
    }
  };

  return (
    <div className="relative text-slate-100 border-b border-white/[0.06] bg-[#080C16]/70 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-2.5 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        
        {/* Left: Compact Utility Status Indicator */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-semibold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              98.4% Supply Operational
            </span>
          </div>

          <div className="h-3 w-[1px] bg-white/[0.1] hidden sm:block" />

          <div className="text-xs text-slate-300 flex items-center gap-1.5">
            <span className="text-white font-medium">Parish Water Services:</span>
            <span className="text-slate-400 hidden lg:inline">Grenada, Carriacou & Petite Martinique Supply Distribution</span>
          </div>
        </div>

        {/* Right: Direct Account Jump & Emergency Hotline */}
        <div className="flex items-center gap-2.5 self-end md:self-auto flex-wrap">
          {/* Quick Account Jump */}
          <form onSubmit={handleQuickSubmit} className="flex items-center gap-1.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                placeholder="Account (ACC-XXXXXX)"
                className="glass-input rounded-lg pl-7 pr-2.5 py-1 text-xs text-white font-mono placeholder:text-slate-500 focus:outline-none w-44"
              />
            </div>
            <button
              type="submit"
              className="px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 text-xs font-medium cursor-pointer transition-all active:scale-[0.98]"
            >
              Search
            </button>
          </form>

          <div className="h-3 w-[1px] bg-white/[0.1] hidden sm:block" />

          {/* Emergency Hotline */}
          <a
            href="tel:276"
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-amber-300 transition-colors font-mono bg-black/40 px-2.5 py-1 rounded-lg border border-white/[0.06]"
          >
            <Phone className="w-3 h-3 text-amber-400" />
            <span>Hotline: <strong className="text-amber-400">276</strong></span>
          </a>
        </div>

      </div>
    </div>
  );
};
