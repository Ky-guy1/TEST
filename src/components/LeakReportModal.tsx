import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, MapPin, Phone, User, FileText, X, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { GRENADA_PARISHES } from '../data/mockData';
import { LeakReport } from '../types';

interface LeakReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeakReportModal: React.FC<LeakReportModalProps> = ({ isOpen, onClose }) => {
  const [location, setLocation] = useState('');
  const [parish, setParish] = useState('St. George');
  const [severity, setSeverity] = useState<'Low' | 'Medium' | 'High' | 'Emergency'>('Medium');
  const [description, setDescription] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<LeakReport | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim() || !description.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/leak/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location,
          parish,
          severity,
          description,
          contactName,
          contactPhone
        })
      });

      const data = await res.json();
      if (data.success && data.ticket) {
        setSubmittedTicket(data.ticket);
      }
    } catch (err) {
      console.error("Leak report error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setLocation('');
    setDescription('');
    setSubmittedTicket(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#0E1424] border border-white/[0.1] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4 text-slate-200"
      >
        <button
          onClick={handleReset}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {!submittedTicket ? (
          <>
            <div className="flex items-center gap-3 border-b border-white/[0.08] pb-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Report Water Pipe Leak</h3>
                <p className="text-xs text-slate-400">Submit pipe repairs & burst reports to NAWASA field dispatch</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Street / Landmark Location *</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Near Grand Anse Roundabout or Main Road, Grenville..."
                    className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none placeholder-slate-500 font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">Parish</label>
                  <select
                    value={parish}
                    onChange={(e) => setParish(e.target.value)}
                    className="w-full glass-input rounded-xl p-2 text-white focus:outline-none cursor-pointer font-sans"
                  >
                    {GRENADA_PARISHES.map((p) => (
                      <option key={p} value={p} className="bg-[#0D1424]">{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full glass-input rounded-xl p-2 text-white focus:outline-none cursor-pointer font-sans"
                  >
                    <option value="Low" className="bg-[#0D1424]">Low (Minor Seep / Drip)</option>
                    <option value="Medium" className="bg-[#0D1424]">Medium (Steady Flow)</option>
                    <option value="High" className="bg-[#0D1424]">High (Road Gushing)</option>
                    <option value="Emergency" className="bg-[#0D1424]">Emergency (Main Trunk Burst)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Description & Details *</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe where the water is flowing from, whether it affects traffic, or if clean water is running down the drain..."
                  className="w-full glass-input rounded-xl p-2.5 text-white focus:outline-none placeholder-slate-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">Reporter Name (Optional)</label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Your name"
                      className="w-full glass-input rounded-xl pl-8 pr-3 py-2 text-white focus:outline-none placeholder-slate-500 font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">Contact Phone (Optional)</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="(473) 440-XXXX"
                      className="w-full glass-input rounded-xl pl-8 pr-3 py-2 text-white focus:outline-none placeholder-slate-500 font-sans font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-semibold text-xs transition-all shadow-md cursor-pointer active:scale-[0.98]"
                >
                  {submitting ? 'Transmitting Ticket...' : 'Dispatch Maintenance Report'}
                </button>
              </div>
            </form>
          </>
        ) : (
          /* Confirmation Ticket Card */
          <div className="space-y-4 text-center py-2">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-semibold text-white">Leak Report Dispatched</h3>
              <p className="text-xs text-slate-400">NAWASA Operations team has been notified of the leak at {submittedTicket.location}.</p>
            </div>

            <div className="bg-black/40 border border-white/[0.06] rounded-xl p-4 text-left text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Ticket Ref:</span>
                <span className="text-amber-300 font-semibold">{submittedTicket.ticketId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Location:</span>
                <span className="text-white truncate max-w-[200px]">{submittedTicket.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Parish:</span>
                <span className="text-white">{submittedTicket.parish}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="text-emerald-400 font-semibold">DISPATCHED TO FIELD UNIT</span>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 text-white font-semibold text-xs cursor-pointer shadow-md active:scale-[0.98]"
            >
              Done & Close
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
