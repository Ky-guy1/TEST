import React, { useState } from 'react';
import { MapPin, AlertTriangle, Users, Filter, Clock, Phone } from 'lucide-react';
import { motion } from 'motion/react';
import { MOCK_OUTAGES, GRENADA_PARISHES } from '../data/mockData';

interface OutageMapProps {
  onOpenLeakModal: () => void;
}

export const OutageMap: React.FC<OutageMapProps> = ({ onOpenLeakModal }) => {
  const [selectedParish, setSelectedParish] = useState<string>('All Parishes');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const filteredOutages = MOCK_OUTAGES.filter((o) => {
    const parishMatch = selectedParish === 'All Parishes' || o.parish.toLowerCase().includes(selectedParish.toLowerCase());
    const statusMatch = filterStatus === 'All' || o.status === filterStatus;
    return parishMatch && statusMatch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Outage Section Header */}
      <div className="glass-panel rounded-2xl p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.3)] relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-sky-500/25 to-transparent" />

        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-semibold text-white tracking-tight">Service Advisories & Distribution Notices</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time parish distribution notices, planned system maintenance, and repair updates across Grenada, Carriacou & Petite Martinique.
          </p>
        </div>

        <button
          onClick={onOpenLeakModal}
          className="flex items-center justify-center gap-2 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-medium px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer shrink-0 active:scale-[0.98]"
        >
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Report a Leak / Burst Main</span>
        </button>
      </div>

      {/* Parish & Filter Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 glass-card p-4 rounded-2xl shadow-md text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-sky-400" />
          <span className="font-medium text-slate-300">Filter Parish:</span>
          <select
            value={selectedParish}
            onChange={(e) => setSelectedParish(e.target.value)}
            className="glass-input rounded-xl px-3 py-1.5 text-white font-medium cursor-pointer focus:outline-none"
          >
            <option value="All Parishes" className="bg-[#0D1424]">All 7 Parishes</option>
            {GRENADA_PARISHES.map((p) => (
              <option key={p} value={p} className="bg-[#0D1424]">{p}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['All', 'Active Maintenance', 'Emergency Outage', 'Restored', 'Scheduled'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded-lg border text-xs font-medium transition-all cursor-pointer whitespace-nowrap active:scale-[0.98] ${
                filterStatus === st
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold shadow-sm border-transparent'
                  : 'bg-black/30 border-white/[0.06] text-slate-400 hover:border-white/[0.12] hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Outage Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredOutages.map((outage) => (
          <motion.div
            key={outage.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-card rounded-2xl p-5 space-y-3 relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.25)] ${
              outage.status === 'Emergency Outage'
                ? 'border-rose-500/30'
                : outage.status === 'Active Maintenance'
                ? 'border-amber-500/30'
                : ''
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono text-sky-400 font-semibold tracking-wider uppercase">
                  {outage.parish} Parish
                </span>
                <h3 className="font-semibold text-white text-base mt-0.5">{outage.area}</h3>
              </div>

              <span
                className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold uppercase border shrink-0 ${
                  outage.status === 'Emergency Outage'
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    : outage.status === 'Active Maintenance'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : outage.status === 'Restored'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                }`}
              >
                {outage.status}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{outage.reason}</p>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.06] text-xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Users className="w-3.5 h-3.5 text-sky-400" />
                <span>Affected Accounts: <strong className="text-slate-200 font-mono">{outage.affectedCustomers.toLocaleString()}</strong></span>
              </div>

              <div className="flex items-center gap-1.5 text-slate-400">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Est. Restoration: <strong className="text-slate-200">{outage.estimatedRestoration}</strong></span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Emergency Hotline Banner */}
      <div className="glass-card rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">24/7 Emergency Dispatch Helpline</h4>
            <p className="text-xs text-slate-400">Direct hotline for emergency pipe bursts, main line ruptures, and severe pressure drops.</p>
          </div>
        </div>

        <a
          href="tel:276"
          className="px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer active:scale-[0.98]"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Call Hotline 276</span>
        </a>
      </div>

    </div>
  );
};
