import React, { useEffect } from 'react';
import { useRouteStore } from '../hooks/useRoute';
import { SILLY_CURRENCIES } from '../lib/currencies';
import { generateRoast } from '../lib/roast';
import { Flame, Calculator } from 'lucide-react';

import confetti from 'canvas-confetti';

export const VerdictBanner: React.FC = () => {
  const { modeResults, selectedCurrencyId } = useRouteStore();

  const winner = modeResults.find((r) => r.isWinner);
  const worst = modeResults.find((r) => r.isWorst);
  const currency = SILLY_CURRENCIES.find((c) => c.id === selectedCurrencyId);

  const roast = generateRoast(winner, worst, currency);

  // Trigger confetti when results calculated
  useEffect(() => {
    if (worst && worst.absurdityIndex > 100) {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#a855f7', '#ec4899', '#3b82f6'],
      });
    }
  }, [worst?.mode.id]);

  if (!modeResults || modeResults.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-950/90 via-slate-900 to-rose-950/90 border border-purple-800/50 p-5 shadow-2xl">
      {/* Background glow overlay */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr,auto] gap-4 items-center">
        {/* Left: Roast */}
        <div className="space-y-2 text-left">
          <div className="flex items-center space-x-2">
            <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider">
              <Flame className="w-3 h-3 text-rose-400 fill-rose-400" /> {roast.badgeText}
            </span>
            <span className="text-xl">{roast.emoji}</span>
          </div>

          <h2 className="text-lg md:text-xl font-black text-white leading-tight">
            {roast.headline}
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
            {roast.subtext}
          </p>
        </div>

        {/* Right: Absurdity Formula Callout */}
        <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800 text-left space-y-1 font-mono text-[11px] text-slate-300 max-w-xs shadow-inner">
          <div className="flex items-center gap-1.5 text-purple-400 font-sans font-bold text-xs">
            <Calculator className="w-3.5 h-3.5" /> Absurdity Index Formula
          </div>
          <p className="text-purple-300 font-semibold bg-purple-950/40 px-2 py-1 rounded border border-purple-800/40 text-[10px]">
            score = (time_hours × cost) / practicality_rating
          </p>
          <p className="text-[10px] text-slate-400 leading-tight">
            Used by Goober AI to crown the absolute most unfeasible travel option.
          </p>
        </div>
      </div>
    </div>
  );
};
