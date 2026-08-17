import React, { useState } from 'react';
import { Calculator, Droplets, Info, TrendingDown, DollarSign, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';

export const TariffCalculator: React.FC = () => {
  const [category, setCategory] = useState<'Domestic' | 'Commercial'>('Domestic');
  const [gallons, setGallons] = useState<number>(4000);

  // NAWASA Tariff Calculation logic
  // Domestic: Tier 1 (0-3000 Gal @ $0.035), Tier 2 (3001-8000 Gal @ $0.045), Tier 3 (8001+ @ $0.060) + Fixed meter fee $18.00
  // Commercial: Flat rate $0.075 / Gal + Fixed meter fee $45.00
  const calculateBill = () => {
    let waterCharge = 0;
    const fixedFee = category === 'Domestic' ? 18.00 : 45.00;

    if (category === 'Domestic') {
      if (gallons <= 3000) {
        waterCharge = gallons * 0.035;
      } else if (gallons <= 8000) {
        waterCharge = (3000 * 0.035) + ((gallons - 3000) * 0.045);
      } else {
        waterCharge = (3000 * 0.035) + (5000 * 0.045) + ((gallons - 8000) * 0.060);
      }
    } else {
      waterCharge = gallons * 0.075;
    }

    const total = Math.round((waterCharge + fixedFee) * 100) / 100;
    const m3 = Math.round((gallons * 0.00378541) * 10) / 10;

    return { waterCharge: Math.round(waterCharge * 100) / 100, fixedFee, total, m3 };
  };

  const calc = calculateBill();

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Header */}
      <div className="glass-panel rounded-2xl p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.3)] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-sky-500/25 to-transparent" />

        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-sky-400" />
          <h2 className="text-lg font-semibold text-white tracking-tight">Statutory Water Rate Calculator</h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Estimate your monthly utility charges based on official National Water and Sewerage Authority (Grenada) statutory rate tiers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Controls Column */}
        <div className="lg:col-span-6 glass-card rounded-2xl p-6 space-y-5 shadow-[0_8px_30px_rgb(0,0,0,0.25)]">
          <h3 className="font-semibold text-white text-xs uppercase tracking-wider border-b border-white/[0.06] pb-2.5">
            Consumption Parameters
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Tariff Class</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCategory('Domestic')}
                  className={`p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    category === 'Domestic'
                      ? 'bg-sky-500/15 border-sky-500/40 text-sky-300 shadow-inner'
                      : 'bg-black/30 border-white/[0.06] text-slate-400 hover:border-white/[0.12] hover:text-slate-200'
                  }`}
                >
                  Domestic / Residential
                </button>
                <button
                  type="button"
                  onClick={() => setCategory('Commercial')}
                  className={`p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    category === 'Commercial'
                      ? 'bg-sky-500/15 border-sky-500/40 text-sky-300 shadow-inner'
                      : 'bg-black/30 border-white/[0.06] text-slate-400 hover:border-white/[0.12] hover:text-slate-200'
                  }`}
                >
                  Commercial / Business
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-slate-300 font-medium">Monthly Consumption Volume</label>
                <span className="font-mono text-sky-400 font-semibold">{gallons.toLocaleString()} Gal ({calc.m3} m³)</span>
              </div>
              <input
                type="range"
                min="500"
                max="50000"
                step="500"
                value={gallons}
                onChange={(e) => setGallons(parseInt(e.target.value))}
                className="w-full accent-sky-500 h-2 bg-black/40 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>500 Gal</span>
                <span>25,000 Gal</span>
                <span>50,000 Gal</span>
              </div>
            </div>

            {/* Presets */}
            <div>
              <label className="block text-slate-400 font-medium mb-1.5">Usage Benchmarks:</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Single Resident (2,000 Gal)', val: 2000 },
                  { label: 'Family of 4 (4,500 Gal)', val: 4500 },
                  { label: 'Large Household (8,000 Gal)', val: 8000 },
                  { label: 'Commercial Business (25,000 Gal)', val: 25000 },
                ].map((preset) => (
                  <button
                    key={preset.val}
                    onClick={() => {
                      setGallons(preset.val);
                      if (preset.val > 10000) setCategory('Commercial');
                      else setCategory('Domestic');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-black/30 hover:bg-white/[0.06] border border-white/[0.08] text-slate-300 text-[11px] cursor-pointer active:scale-[0.98]"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Calculated Result Column */}
        <div className="lg:col-span-6 glass-card rounded-2xl p-6 space-y-5 shadow-[0_8px_30px_rgb(0,0,0,0.25)]">
          <div>
            <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Estimated Monthly Bill</span>
            <div className="text-3xl sm:text-4xl font-bold text-white font-mono mt-1">
              EC$ {calc.total.toFixed(2)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Estimated charge for {gallons.toLocaleString()} Gallons ({calc.m3} m³) in {category} tariff.
            </p>
          </div>

          <div className="space-y-2.5 pt-3 border-t border-white/[0.06] text-xs">
            <div className="flex justify-between items-center py-1 border-b border-white/[0.04]">
              <span className="text-slate-400">Volumetric Water Charge:</span>
              <span className="font-mono text-white">EC$ {calc.waterCharge.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-white/[0.04]">
              <span className="text-slate-400">Fixed Monthly Service & Meter Charge:</span>
              <span className="font-mono text-white">EC$ {calc.fixedFee.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center pt-1 font-semibold text-slate-200">
              <span>Total Estimated Charge:</span>
              <span className="font-mono text-sky-400 text-sm">EC$ {calc.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-black/30 border border-white/[0.06] rounded-xl p-3.5 space-y-1.5 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 text-sky-400 font-semibold text-[11px] uppercase tracking-wider">
              <Info className="w-3.5 h-3.5" />
              <span>Official Tariff Tier Breakdown</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Domestic Tier 1: 0 - 3,000 Gal @ $0.035/Gal | Tier 2: 3,001 - 8,000 Gal @ $0.045/Gal | Tier 3: 8,001+ Gal @ $0.060/Gal. Fixed meter charge of EC$ 18.00/month applies.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
