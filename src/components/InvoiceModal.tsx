import React from 'react';
import { Printer, Download, X, Droplet, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { WaterBill } from '../types';

interface InvoiceModalProps {
  bill: WaterBill | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ bill, isOpen, onClose }) => {
  if (!isOpen || !bill) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#0E1424] border border-white/[0.1] rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative space-y-6 my-8 text-slate-100 print:text-black print:bg-white"
      >
        {/* Controls */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <Droplet className="w-5 h-5 text-sky-400" />
            <h3 className="font-semibold text-white text-base">Official NAWASA Statement</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-xs shadow-md shadow-sky-500/20 transition-all cursor-pointer active:scale-[0.98]"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Sheet */}
        <div id="printable-invoice" className="space-y-6 text-xs">
          
          {/* Official Letterhead */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-white/[0.08] pb-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center font-bold">
                  <Droplet className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-white tracking-wide">NAWASA GRENADA</h2>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">National Water and Sewerage Authority</p>
              <p className="text-[10px] text-slate-500 font-mono">The Carenage, P.O. Box 392, St. George's, Grenada, W.I.</p>
              <p className="text-[10px] text-slate-500 font-mono">Hotlines: 276 / 440-2155 • Email: nawasa@nawasa.gd</p>
            </div>

            <div className="text-left sm:text-right font-mono bg-black/40 p-3 rounded-xl border border-white/[0.06]">
              <div className="text-sky-400 font-semibold text-xs">WATER SERVICE STATEMENT</div>
              <div className="text-slate-400 mt-0.5">Statement #: <strong className="text-slate-200">INV-{bill.accountNumber}</strong></div>
              <div className="text-slate-400">Period: {bill.billingPeriod}</div>
              <div className="text-slate-400">Due Date: <strong className="text-amber-400">{bill.dueDate}</strong></div>
            </div>
          </div>

          {/* Customer & Meter Section */}
          <div className="grid grid-cols-2 gap-4 bg-black/30 p-4 rounded-xl border border-white/[0.06]">
            <div>
              <div className="text-[10px] uppercase font-semibold text-slate-500">Bill To Customer</div>
              <div className="font-semibold text-white text-sm mt-0.5">{bill.customerName}</div>
              <div className="text-slate-300 mt-0.5">{bill.serviceAddress}</div>
              <div className="text-slate-400">{bill.parish} Parish, Grenada</div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-semibold text-slate-500">Meter & Service Info</div>
              <div className="text-slate-300 mt-0.5">Account #: <strong className="font-mono text-white">{bill.accountNumber}</strong></div>
              <div className="text-slate-300">Meter #: <strong className="font-mono text-white">{bill.meterNumber}</strong></div>
              <div className="text-slate-300">Category: <strong className="text-sky-300">{bill.serviceType} Tariff</strong></div>
            </div>
          </div>

          {/* Line Item Table */}
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] text-slate-400 text-[11px] font-mono uppercase">
                <th className="py-2 px-2">Description</th>
                <th className="py-2 px-2 text-center">Volume</th>
                <th className="py-2 px-2 text-right">Amount (XCD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              <tr>
                <td className="py-2.5 px-2">
                  <div className="font-medium text-white">Water Consumption Volume</div>
                  <div className="text-[10px] text-slate-400">Meter Reading Period {bill.billingPeriod}</div>
                </td>
                <td className="py-2.5 px-2 text-center font-mono text-slate-300">
                  {bill.consumptionGallons.toLocaleString()} Gal ({bill.consumptionM3} m³)
                </td>
                <td className="py-2.5 px-2 text-right font-mono text-sky-300">
                  EC$ {(bill.currentBalance * 0.85).toFixed(2)}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-2">
                  <div className="font-medium text-white">Sewerage & Infrastructure Maintenance</div>
                  <div className="text-[10px] text-slate-400">Parish water grid infrastructure maintenance</div>
                </td>
                <td className="py-2.5 px-2 text-center text-slate-400">-</td>
                <td className="py-2.5 px-2 text-right font-mono text-sky-300">
                  EC$ {(bill.currentBalance * 0.15).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Total & Payment Options Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-3 border-t border-white/[0.08]">
            <div className="text-[11px] text-slate-400 space-y-1">
              <p className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                <span>Authorized by National Water and Sewerage Authority (NAWASA)</span>
              </p>
              <p>Payable via Grenada Co-operative Bank, Republic Bank, or NAWASA Online Portal.</p>
            </div>

            <div className="bg-black/40 p-4 rounded-xl border border-white/[0.06] text-right w-full sm:w-auto">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Total Outstanding</div>
              <div className="text-xl font-bold text-sky-400 font-mono mt-0.5">
                EC$ {bill.currentBalance.toFixed(2)}
              </div>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
};
