import React from 'react';
import { Droplets, Phone, AlertTriangle, MessageSquare, Receipt, MapPin, Calculator } from 'lucide-react';

interface NavbarProps {
  activeTab: 'chat' | 'bills' | 'outages' | 'calculator';
  setActiveTab: (tab: 'chat' | 'bills' | 'outages' | 'calculator') => void;
  onOpenLeakModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenLeakModal }) => {
  return (
    <header className="sticky top-0 z-40 bg-[#090D16]/90 backdrop-blur-xl border-b border-white/[0.08] text-slate-100 transition-all font-sans">
      {/* Top Advisory Notice Strip */}
      <div className="bg-[#060910]/95 px-4 sm:px-8 py-1.5 text-xs border-b border-white/[0.05] flex items-center justify-between text-slate-400">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-mono font-semibold tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Grid Operational
          </span>
          <span className="hidden md:inline text-slate-400 text-xs font-normal">
            National Water & Sewerage Authority • Grenada, Carriacou & Petite Martinique
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono">
          <a
            href="tel:4402155"
            className="flex items-center gap-1.5 hover:text-sky-300 transition-colors text-slate-300"
          >
            <Phone className="w-3 h-3 text-sky-400" />
            <span>Emergency: <strong className="text-amber-400 font-medium">276</strong> | Central: <strong className="text-slate-200 font-medium">(473) 440-2155</strong></span>
          </a>
        </div>
      </div>

      {/* Main Navigation - 3 Zone Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Zone 1: Brand Wordmark (Single Line) */}
        <button
          onClick={() => setActiveTab('chat')}
          className="flex items-center gap-2.5 group cursor-pointer text-left focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400 group-hover:border-sky-400/50 transition-all">
            <Droplets className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-semibold text-base sm:text-lg tracking-tight text-white group-hover:text-sky-300 transition-colors whitespace-nowrap">
              NAWASA
            </span>
            <span className="text-slate-400 text-xs font-normal tracking-normal uppercase font-mono hidden sm:inline">
              Customer Portal
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links (Linear/Vercel Style Segmented Control) */}
        <nav className="hidden md:flex items-center gap-1 bg-[#0D1424]/90 p-1 rounded-xl border border-white/[0.08]">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'chat'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Support Desk</span>
          </button>

          <button
            onClick={() => setActiveTab('bills')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'bills'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Account & Bills</span>
          </button>

          <button
            onClick={() => setActiveTab('outages')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'outages'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Service Advisories</span>
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'calculator'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Rate Calculator</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenLeakModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/25 text-amber-300 hover:text-amber-200 font-medium text-xs transition-all cursor-pointer whitespace-nowrap active:scale-[0.98]"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Report a Leak</span>
          </button>
        </div>

      </div>

      {/* Mobile Segmented Strip */}
      <div className="flex md:hidden border-t border-white/[0.06] bg-[#0A0E18]/95 p-1.5 gap-1 text-xs">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'chat' ? 'bg-sky-500 text-white font-semibold shadow-sm' : 'text-slate-400'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Support</span>
        </button>
        <button
          onClick={() => setActiveTab('bills')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'bills' ? 'bg-sky-500 text-white font-semibold shadow-sm' : 'text-slate-400'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Bills</span>
        </button>
        <button
          onClick={() => setActiveTab('outages')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'outages' ? 'bg-sky-500 text-white font-semibold shadow-sm' : 'text-slate-400'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Advisories</span>
        </button>
        <button
          onClick={() => setActiveTab('calculator')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'calculator' ? 'bg-sky-500 text-white font-semibold shadow-sm' : 'text-slate-400'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Rates</span>
        </button>
      </div>
    </header>
  );
};
