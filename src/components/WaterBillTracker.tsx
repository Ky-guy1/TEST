import React, { useState, useEffect } from 'react';
import { Search, Receipt, Calendar, CreditCard, Download, CheckCircle2, BarChart3, User, ShieldCheck, X, MessageSquare } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { WaterBill } from '../types';
import { getOrCreateBill, MOCK_BILLS } from '../data/mockData';

interface WaterBillTrackerProps {
  initialAccountNumber?: string;
  onAskAIAboutBill: (query: string) => void;
  onOpenInvoiceModal: (bill: WaterBill) => void;
}

export const WaterBillTracker: React.FC<WaterBillTrackerProps> = ({
  initialAccountNumber = 'ACC-849201',
  onAskAIAboutBill,
  onOpenInvoiceModal,
}) => {
  const [accountQuery, setAccountQuery] = useState<string>(initialAccountNumber);
  const [currentBill, setCurrentBill] = useState<WaterBill>(getOrCreateBill(initialAccountNumber));
  const [loading, setLoading] = useState<boolean>(false);
  
  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(currentBill.currentBalance);
  const [paymentMethod, setPaymentMethod] = useState<string>('Grenada Co-operative Bank');
  const [processingPayment, setProcessingPayment] = useState<boolean>(false);
  const [paymentSuccessReceipt, setPaymentSuccessReceipt] = useState<any | null>(null);

  useEffect(() => {
    if (initialAccountNumber) {
      setAccountQuery(initialAccountNumber);
      handleSearchBill(initialAccountNumber);
    }
  }, [initialAccountNumber]);

  const handleSearchBill = async (queryToSearch?: string) => {
    const q = (queryToSearch || accountQuery).trim();
    if (!q) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/bill/lookup?accountNumber=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.success && data.bill) {
        setCurrentBill(data.bill);
        setPaymentAmount(data.bill.currentBalance);
      } else {
        const fallback = getOrCreateBill(q);
        setCurrentBill(fallback);
        setPaymentAmount(fallback.currentBalance);
      }
    } catch (err) {
      console.error("Bill fetch error:", err);
      const fallback = getOrCreateBill(q);
      setCurrentBill(fallback);
      setPaymentAmount(fallback.currentBalance);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentAmount <= 0) return;

    setProcessingPayment(true);
    try {
      const res = await fetch('/api/bill/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountNumber: currentBill.accountNumber,
          amountPaid: paymentAmount,
          paymentMethod
        })
      });

      const data = await res.json();
      if (data.success) {
        setPaymentSuccessReceipt(data.receipt);
        setCurrentBill(data.bill);
        
        confetti({
          particleCount: 70,
          spread: 55,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error("Payment error:", err);
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Search Header Bar */}
      <div className="glass-panel rounded-2xl p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.3)] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-sky-500/25 to-transparent" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-sky-400" />
              <h2 className="text-lg font-semibold text-white tracking-tight">Water Account Ledger & Payments</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Look up active utility accounts, billing records, and online settlement status across Grenada, Carriacou & Petite Martinique.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearchBill();
            }}
            className="flex items-center gap-2 w-full md:w-auto"
          >
            <div className="relative flex-1 md:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={accountQuery}
                onChange={(e) => setAccountQuery(e.target.value)}
                placeholder="Account Number (e.g. ACC-849201)..."
                className="w-full glass-input rounded-xl pl-10 pr-4 py-2 text-sm text-white font-mono placeholder:text-slate-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-xs transition-all cursor-pointer shrink-0 shadow-md active:scale-[0.98]"
            >
              {loading ? 'Searching...' : 'Lookup'}
            </button>
          </form>
        </div>

        {/* Quick Select Preset Account Chips */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3.5 border-t border-white/[0.06] text-xs">
          <span className="text-slate-400 font-medium">Sample Accounts:</span>
          {MOCK_BILLS.map((b) => (
            <button
              key={b.accountNumber}
              onClick={() => {
                setAccountQuery(b.accountNumber);
                handleSearchBill(b.accountNumber);
              }}
              className={`px-3 py-1 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
                currentBill.accountNumber === b.accountNumber
                  ? 'bg-sky-500/15 border-sky-500/40 text-sky-300 font-semibold shadow-inner'
                  : 'bg-black/30 border-white/[0.06] text-slate-400 hover:border-white/[0.12] hover:text-slate-200'
              }`}
            >
              {b.accountNumber} ({b.customerName.split(' ')[0]})
            </button>
          ))}
        </div>
      </div>

      {/* Bill Details Main Display Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Account Summary & Status */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Main Balance Card */}
          <div className="glass-card rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.3)] relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Current Balance</span>
              <span
                className={`px-2.5 py-0.5 rounded text-xs font-mono font-semibold uppercase tracking-wider border ${
                  currentBill.status === 'Paid'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : currentBill.status === 'Overdue'
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}
              >
                {currentBill.status}
              </span>
            </div>

            <div className="mt-4">
              <div className="text-3xl sm:text-4xl font-semibold text-white font-mono tracking-tight">
                EC$ {currentBill.currentBalance.toFixed(2)}
              </div>
              <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-sky-400" />
                <span>Payment Due Date: <strong className="text-slate-200 font-semibold">{currentBill.dueDate}</strong></span>
              </p>
            </div>

            <div className="mt-6 space-y-2.5 border-t border-white/[0.06] pt-4">
              <button
                onClick={() => {
                  setPaymentSuccessReceipt(null);
                  setPaymentAmount(currentBill.currentBalance);
                  setShowPaymentModal(true);
                }}
                disabled={currentBill.currentBalance <= 0}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-40 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <CreditCard className="w-4 h-4" />
                <span>{currentBill.currentBalance > 0 ? 'Pay Outstanding Balance' : 'Account Settled in Full'}</span>
              </button>

              <button
                onClick={() => onOpenInvoiceModal(currentBill)}
                className="w-full py-2 px-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] text-slate-300 hover:text-white text-xs font-medium transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <Download className="w-4 h-4 text-sky-400" />
                <span>Download Official Statement</span>
              </button>
            </div>
          </div>

          {/* Account Details Card */}
          <div className="glass-card rounded-2xl p-5 space-y-3 shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/[0.06] pb-2.5">
              <User className="w-4 h-4 text-sky-400" />
              <span>Customer Account Record</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-white/[0.04]">
                <span className="text-slate-400">Account Number:</span>
                <span className="font-mono font-semibold text-sky-300">{currentBill.accountNumber}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-white/[0.04]">
                <span className="text-slate-400">Customer Name:</span>
                <span className="font-medium text-white">{currentBill.customerName}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-white/[0.04]">
                <span className="text-slate-400">Service Address:</span>
                <span className="text-slate-200 text-right">{currentBill.serviceAddress}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-white/[0.04]">
                <span className="text-slate-400">Parish:</span>
                <span className="text-slate-200">{currentBill.parish}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-white/[0.04]">
                <span className="text-slate-400">Meter Number:</span>
                <span className="font-mono text-slate-300">{currentBill.meterNumber}</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Tariff Class:</span>
                <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 font-medium border border-sky-500/20 text-[11px]">
                  {currentBill.serviceType}
                </span>
              </div>
            </div>

            {/* Inquire about bill */}
            <div className="pt-2">
              <button
                onClick={() => onAskAIAboutBill(`Can you explain my current NAWASA water bill for ${currentBill.accountNumber}? The balance is EC$ ${currentBill.currentBalance.toFixed(2)} with ${currentBill.consumptionGallons} gallons consumption.`)}
                className="w-full p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] text-sky-300 hover:text-sky-200 text-xs font-medium flex items-center justify-between group transition-all cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-sky-400" />
                  <span>Inquire with Support Desk</span>
                </div>
                <Receipt className="w-4 h-4 text-sky-400" />
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Historical Usage Chart & Billing Breakdown */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Usage Chart */}
          <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-sky-400" />
                  <span>6-Month Consumption History</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Monthly volume in Gallons & associated EC$ billing amounts</p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-sky-400 font-mono text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" />
                  Gallons
                </span>
              </div>
            </div>

            <div className="h-60 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentBill.usageHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGallons" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0D1424', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    formatter={(val: any, name: any) => [
                      name === 'gallons' ? `${Number(val).toLocaleString()} Gal` : `EC$ ${val}`,
                      name === 'gallons' ? 'Consumption' : 'Bill Amount'
                    ]}
                  />
                  <Area type="monotone" dataKey="gallons" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#colorGallons)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Current Period Line Item Breakdown */}
          <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-3 shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
            <h3 className="font-semibold text-white text-xs uppercase tracking-wider border-b border-white/[0.06] pb-2.5">
              Billing Period Itemized Charges ({currentBill.billingPeriod})
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-white/[0.04]">
                <span className="text-slate-400">Previous Balance Forward</span>
                <span className="font-mono text-slate-300">EC$ {currentBill.previousBalance.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-white/[0.04]">
                <div>
                  <div className="text-white font-medium">Water Volume Consumption</div>
                  <div className="text-[11px] text-slate-400">
                    {currentBill.consumptionGallons.toLocaleString()} Gallons ({currentBill.consumptionM3} m³) @ Gazette Rates
                  </div>
                </div>
                <span className="font-mono text-sky-300">EC$ {(currentBill.currentBalance * 0.85).toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-white/[0.04]">
                <div>
                  <div className="text-white font-medium">Sewerage & Meter Maintenance</div>
                  <div className="text-[11px] text-slate-400">Standard monthly infrastructure service fee</div>
                </div>
                <span className="font-mono text-sky-300">EC$ {(currentBill.currentBalance * 0.15).toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center pt-2 text-sm font-semibold text-white">
                <span>Total Balance Payable</span>
                <span className="font-mono text-sky-400">EC$ {currentBill.currentBalance.toFixed(2)}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Online Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0E1424] border border-white/[0.1] rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4 text-slate-200"
            >
              <button
                onClick={() => setShowPaymentModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {!paymentSuccessReceipt ? (
                <>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-sky-400" />
                      <h3 className="text-base font-semibold text-white">NAWASA Payment Gateway</h3>
                    </div>
                    <p className="text-xs text-slate-400">
                      Processing settlement for Account <strong className="font-mono text-sky-300">{currentBill.accountNumber}</strong>
                    </p>
                  </div>

                  <form onSubmit={handleProcessPayment} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1.5">Authorized Financial Outlet / Banking Partner:</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full glass-input rounded-xl p-2.5 text-white focus:outline-none"
                      >
                        <option value="Grenada Co-operative Bank" className="bg-[#0D1424]">Grenada Co-operative Bank (E-Banking)</option>
                        <option value="Republic Bank Grenada" className="bg-[#0D1424]">Republic Bank Grenada Ltd</option>
                        <option value="RBTT Grenada Direct" className="bg-[#0D1424]">RBTT Bank Grenada</option>
                        <option value="Visa / Mastercard Debit" className="bg-[#0D1424]">Visa / Mastercard Debit Card</option>
                        <option value="MoMobile Grenada" className="bg-[#0D1424]">MoMobile Wallet</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1.5">Amount to Pay (EC$):</label>
                      <input
                        type="number"
                        step="0.01"
                        max={currentBill.currentBalance}
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                        className="w-full glass-input rounded-xl p-2.5 text-white font-mono text-sm focus:outline-none"
                      />
                    </div>

                    <div className="bg-black/40 border border-white/[0.06] p-3 rounded-xl flex items-center gap-2 text-slate-300">
                      <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0" />
                      <span className="text-[11px] leading-relaxed">
                        Direct 256-bit encryption. Settlements update your NAWASA ledger immediately.
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={processingPayment || paymentAmount <= 0}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 font-semibold text-white text-xs transition-all cursor-pointer shadow-md active:scale-[0.98]"
                    >
                      {processingPayment ? 'Authorizing Payment...' : `Confirm & Settle EC$ ${paymentAmount.toFixed(2)}`}
                    </button>
                  </form>
                </>
              ) : (
                /* Payment Success Receipt Screen */
                <div className="space-y-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-white">Payment Authorized</h3>
                    <p className="text-xs text-slate-400">Transaction successfully credited to NAWASA account ledger</p>
                  </div>

                  <div className="bg-black/40 border border-white/[0.06] rounded-xl p-4 text-left text-xs space-y-2 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Receipt Ref:</span>
                      <span className="text-sky-300 font-semibold">{paymentSuccessReceipt.receiptId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Account #:</span>
                      <span className="text-white">{paymentSuccessReceipt.accountNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Amount Settled:</span>
                      <span className="text-emerald-400 font-semibold">EC$ {paymentSuccessReceipt.amountPaid.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Remaining Balance:</span>
                      <span className="text-white">EC$ {paymentSuccessReceipt.remainingBalance.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Channel:</span>
                      <span className="text-slate-300">{paymentSuccessReceipt.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-white/[0.06] text-[10px]">
                      <span className="text-slate-500">Timestamp:</span>
                      <span className="text-slate-400">{paymentSuccessReceipt.timestamp}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-xs cursor-pointer shadow-md active:scale-[0.98]"
                  >
                    Done & Return to Ledger
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
