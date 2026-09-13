export interface SillyCurrency {
  id: string;
  name: string;
  emoji: string;
  inrRate: number; // units of currency per 1 INR (₹)
  unitName: string;
  description: string;
}

export const SILLY_CURRENCIES: SillyCurrency[] = [
  {
    id: 'inr',
    name: 'Indian Rupees (₹)',
    emoji: '₹',
    inrRate: 1,
    unitName: 'INR',
    description: 'Standard Indian Rupee currency.',
  },
  {
    id: 'apples',
    name: 'Granny Smith Apples',
    emoji: '🍎',
    inrRate: 0.04, // ₹25 per apple
    unitName: 'apples',
    description: 'Keeps doctors away, but won\'t pay your landlord.',
  },
  {
    id: 'oranges',
    name: 'Juicy Oranges',
    emoji: '🍊',
    inrRate: 0.05, // ₹20 per orange
    unitName: 'oranges',
    description: 'Packed with Vitamin C and travel regret.',
  },
  {
    id: 'rubberducks',
    name: 'Squeaky Rubber Ducks',
    emoji: '🦆',
    inrRate: 0.00833, // ₹120 per duck
    unitName: 'ducks',
    description: 'Essential for bath time and software debugging.',
  },
  {
    id: 'kidneys',
    name: 'Black-Market Kidneys',
    emoji: '🫘',
    inrRate: 0.0000001428, // ₹7,000,000 per kidney
    unitName: 'kidneys',
    description: 'You only have two. Spend them wisely on trip fares.',
  },
  {
    id: 'sourdough',
    name: 'Artisanal Sourdough',
    emoji: '🍞',
    inrRate: 0.00285, // ₹350 per loaf
    unitName: 'loaves',
    description: 'Fermented for 72 hours with hipsters\' tears.',
  },
  {
    id: 'minwage',
    name: 'Min-Wage Work Hours',
    emoji: '⏳',
    inrRate: 0.01, // ₹100 per hour
    unitName: 'hours of labor',
    description: 'Hours of soul-crushing work required.',
  },
];

export function convertFromINR(amountINR: number, currencyId: string): { amount: number; formatted: string } {
  const curr = SILLY_CURRENCIES.find((c) => c.id === currencyId) || SILLY_CURRENCIES[0];
  const val = amountINR * curr.inrRate;

  let formatted = '';
  if (curr.id === 'inr') {
    formatted = `₹${Math.round(val).toLocaleString('en-IN')}`;
  } else if (curr.id === 'kidneys') {
    if (val < 0.001) {
      formatted = `${(val * 100).toFixed(4)}% of a Kidney ${curr.emoji}`;
    } else {
      formatted = `${val.toFixed(4)} Kidneys ${curr.emoji}`;
    }
  } else if (val < 10) {
    formatted = `${val.toFixed(1)} ${curr.unitName} ${curr.emoji}`;
  } else {
    formatted = `${Math.round(val).toLocaleString('en-IN')} ${curr.unitName} ${curr.emoji}`;
  }

  return { amount: val, formatted };
}
