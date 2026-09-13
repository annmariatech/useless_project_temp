import type { CalculatedModeResult } from '../lib/routing';
import { convertFromINR } from '../lib/currencies';
import { useRouteStore } from '../hooks/useRoute';
import { Clock, DollarSign, Zap, Skull, Trophy, Sparkles, CheckCircle2 } from 'lucide-react';

interface ModeCardProps {
  result: CalculatedModeResult;
}

export const ModeCard: React.FC<ModeCardProps> = ({ result }) => {
  const { mode, durationFormatted, costINR, absurdityIndex, isWinner, isWorst } = result;

  const { selectedCurrencyId, selectedModeId, setSelectedMode } = useRouteStore();

  const isSelected = selectedModeId === mode.id;
  const convertedCurrency = convertFromINR(costINR, selectedCurrencyId);

  return (
    <div
      onClick={() => setSelectedMode(mode.id)}
      className={`relative group rounded-2xl p-4 transition-all duration-300 cursor-pointer text-left border ${
        isSelected
          ? 'bg-slate-900/90 border-purple-500 shadow-xl ring-2 ring-purple-500/50 scale-[1.02]'
          : isWinner
          ? 'bg-emerald-950/20 border-emerald-500/50 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-950/50'
          : isWorst
          ? 'bg-rose-950/20 border-rose-500/50 hover:border-rose-400 hover:shadow-lg hover:shadow-rose-950/50'
          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80'
      }`}
    >
      {/* Crown Badges */}
      <div className="absolute -top-3 right-3 flex items-center gap-1.5 z-10">
        {isWinner && (
          <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1 uppercase tracking-wider">
            <Trophy className="w-3 h-3 fill-slate-950" /> Winner
          </span>
        )}
        {isWorst && (
          <span className="bg-gradient-to-r from-rose-600 to-pink-600 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1 uppercase tracking-wider animate-pulse">
            <Skull className="w-3 h-3 text-white" /> Absolute Worst
          </span>
        )}
      </div>

      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute top-3 left-3 text-purple-400">
          <CheckCircle2 className="w-4 h-4" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3 pt-1">
        <div className="flex items-center space-x-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner border border-slate-700/50"
            style={{ backgroundColor: `${mode.accentColor}20` }}
          >
            {mode.emoji}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base group-hover:text-purple-300 transition">
                {mode.label}
              </h3>
              {mode.straightLineOnly && (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono">
                  Straight-Line
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">{mode.notes}</p>
          </div>
        </div>
      </div>

      {/* Metrics Breakdown Grid */}
      <div className="grid grid-cols-2 gap-2 my-3 text-xs bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/80">
        <div className="flex items-center space-x-2">
          <Clock className="w-3.5 h-3.5 text-purple-400" />
          <div>
            <span className="text-[10px] text-slate-400 block">Travel Time</span>
            <span className="font-bold text-slate-100">{durationFormatted}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <div>
            <span className="text-[10px] text-slate-400 block">Speed</span>
            <span className="font-semibold text-slate-200">{mode.speedKmh} km/h</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          <div>
            <span className="text-[10px] text-slate-400 block">INR Cost</span>
            <span className="font-semibold text-slate-200">₹{costINR.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Sparkles className="w-3.5 h-3.5 text-rose-400" />
          <div>
            <span className="text-[10px] text-slate-400 block">Absurdity Index</span>
            <span className="font-mono font-bold text-purple-300">{absurdityIndex}</span>
          </div>
        </div>
      </div>

      {/* Silly Currency Box */}
      <div className="mt-2 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-800/40 rounded-xl px-3 py-2 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 font-medium">Silly Price:</span>
        <span className="text-xs font-bold text-amber-300 font-mono">
          {convertedCurrency.formatted}
        </span>
      </div>
    </div>
  );
};
