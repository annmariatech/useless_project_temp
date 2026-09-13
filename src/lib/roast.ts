import type { CalculatedModeResult } from './routing';
import type { SillyCurrency } from './currencies';


export interface RoastResult {
  headline: string;
  subtext: string;
  badgeText: string;
  emoji: string;
}

const GENERAL_ROASTS = [
  "Congratulations, you just spent 10 minutes calculating how long a Pogo Stick trip to another continent takes.",
  "Google Maps recommends driving. GooberMaps recommends swinging from buildings like a masked vigilante.",
  "Your travel itinerary is officially classified as a psychiatric emergency.",
  "Why take a 20-minute bus ride when you can risk life and limb on a unicycle for 4 hours?",
  "The Department of Transportation has revoked your rights to travel planning.",
  "Your wallet is weeping, your legs are shaking, but your Goober ratio is immaculate.",
];

export function generateRoast(
  winner?: CalculatedModeResult,
  worst?: CalculatedModeResult,
  currency?: SillyCurrency
): RoastResult {
  if (!winner || !worst) {
    return {
      headline: "Select two points to generate maximum travel chaos!",
      subtext: "Enter a starting location and destination to unleash GooberMaps algorithms.",
      badgeText: "Awaiting Input 🧭",
      emoji: "🤪",
    };
  }

  const distanceFormatted = `${Math.round(winner.distanceKm)} km`;
  const currName = currency ? currency.name : "dollars";

  // Special roasts if Worst is Zipline or Spider-Man
  if (worst.mode.id === 'zipline') {
    return {
      headline: `Ziplining ${distanceFormatted} is officially certified insanity!`,
      subtext: `Installing ${distanceFormatted} of high-tension industrial cable will cost ${worst.costUSD.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}, or roughly ${worst.absurdityIndex.toLocaleString()} absurd points. City council is sending police.`,
      badgeText: "Absurdity Winner 🏆",
      emoji: "🪢",
    };
  }

  if (worst.mode.id === 'spiderman') {
    return {
      headline: `Spider-Man mode requires ${worst.costUSD.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} in webbing refills!`,
      subtext: `Unless you're traveling strictly between skyscrapers, you'll slam into a strip mall after 200 meters.`,
      badgeText: "High Chaos Alert 🕷️",
      emoji: "🕷️",
    };
  }

  if (worst.mode.id === 'pogostick') {
    return {
      headline: `Pogo Stick trip will take ${worst.durationFormatted} of non-stop bouncing!`,
      subtext: `Your spinal discs will compress into diamond. At least you paid in ${currName}.`,
      badgeText: "Spine Destruction 🦘",
      emoji: "🦘",
    };
  }

  const randomRoast = GENERAL_ROASTS[Math.floor(Math.random() * GENERAL_ROASTS.length)];

  return {
    headline: `Fastest mode: ${winner.mode.emoji} ${winner.mode.label} (${winner.durationFormatted}) vs Worst: ${worst.mode.emoji} ${worst.mode.label} (${worst.durationFormatted})`,
    subtext: randomRoast,
    badgeText: "Goober Verdict 🤡",
    emoji: "🎭",
  };
}
