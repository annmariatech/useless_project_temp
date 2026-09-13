import React from 'react';
import { useRouteStore } from '../hooks/useRoute';
import { SILLY_CURRENCIES } from '../lib/currencies';
import { Coins } from 'lucide-react';


export const PaymentConverter: React.FC = () => {
  const { selectedCurrencyId, setSelectedCurrency } = useRouteStore();
  const activeCurrency =
    SILLY_CURRENCIES.find((c) => c.id === selectedCurrencyId) || SILLY_CURRENCIES[0];

  return (
    <div className="glass-card rounded-2xl p-4 border border-slate-700/60 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Coins className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="text-sm font-bold text-white">Goober Economy Standard</h3>
            <p className="text-[11px] text-slate-400">Convert trip costs into ridiculous units</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <label htmlFor="currency-select" className="text-xs text-slate-300 font-medium">
            Pay with:
          </label>
          <select
            id="currency-select"
            value={selectedCurrencyId}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-purple-300 font-semibold text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none cursor-pointer transition hover:border-purple-500/50"
          >
            {SILLY_CURRENCIES.map((curr) => (
              <option key={curr.id} value={curr.id}>
                {curr.emoji} {curr.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeCurrency.id !== 'inr' && (
        <div className="mt-3 text-[11px] text-amber-300/90 bg-amber-950/30 border border-amber-800/40 rounded-xl px-3 py-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="text-base">{activeCurrency.emoji}</span>
            <span>{activeCurrency.description}</span>
          </span>
          <span className="font-mono text-amber-200 text-[10px] bg-amber-900/50 px-2 py-0.5 rounded border border-amber-700/50 whitespace-nowrap">
            1 INR = {activeCurrency.inrRate} {activeCurrency.unitName}
          </span>
        </div>
      )}
    </div>
  );
};
