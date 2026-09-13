export interface TransportMode {
  id: string;
  label: string;
  emoji: string;
  speedKmh: number; // base speed in km/h
  costPerKmINR: number; // cost per km in Indian Rupees (₹)
  isAbsurd: boolean;
  chaosFactor: number; // 0 to 100%
  practicalityRating: number; // 1 to 10 scale
  straightLineOnly?: boolean;
  notes: string;
  accentColor: string;
}

export const TRANSPORT_MODES: TransportMode[] = [
  // Normal Modes
  {
    id: 'walking',
    label: 'Walking',
    emoji: '🚶',
    speedKmh: 5,
    costPerKmINR: 15, // shoe wear & coconut water hydration
    isAbsurd: false,
    chaosFactor: 5,
    practicalityRating: 8.5,
    notes: 'Simple, eco-friendly, but your legs will ache on long distances.',
    accentColor: '#10b981', // green
  },
  {
    id: 'cycling',
    label: 'Cycling',
    emoji: '🚲',
    speedKmh: 18,
    costPerKmINR: 10, // bike chain lube & inner tubes
    isAbsurd: false,
    chaosFactor: 15,
    practicalityRating: 9.0,
    notes: 'Efficient and stylish, until monsoon rain hits or stray dogs chase you.',
    accentColor: '#06b6d4', // cyan
  },
  {
    id: 'driving',
    label: 'Driving',
    emoji: '🚗',
    speedKmh: 55,
    costPerKmINR: 65, // petrol, insurance, toll gates
    isAbsurd: false,
    chaosFactor: 25,
    practicalityRating: 9.5,
    notes: 'Fast and comfortable, provided you enjoy sitting in peak-hour traffic jams.',
    accentColor: '#3b82f6', // blue
  },

  // Absurd Modes
  {
    id: 'spiderman',
    label: 'Spider-Man Web-Swing',
    emoji: '🕷️',
    speedKmh: 75,
    costPerKmINR: 1250, // high-grade web-fluid refills & suit dry cleaning
    isAbsurd: true,
    chaosFactor: 95,
    practicalityRating: 2.0,
    notes: 'Thwip! Only travels via high-rise building corridors for web anchor points.',
    accentColor: '#ef4444', // red
  },
  {
    id: 'unicycle',
    label: 'Unicycle',
    emoji: '🎪',
    speedKmh: 11,
    costPerKmINR: 45, // circus tuition & knee replacements
    isAbsurd: true,
    chaosFactor: 70,
    practicalityRating: 3.0,
    notes: 'Half the wheels, double the dignity loss. Core workout guaranteed.',
    accentColor: '#f59e0b', // amber
  },
  {
    id: 'pogostick',
    label: 'Pogo Stick',
    emoji: '🦘',
    speedKmh: 7.5,
    costPerKmINR: 180, // heavy-duty springs & spine chiropractic alignment
    isAbsurd: true,
    chaosFactor: 85,
    practicalityRating: 1.5,
    notes: 'Rhythmic hopping down the road. Vertigo and concussions included.',
    accentColor: '#ec4899', // pink
  },
  {
    id: 'rollerskates',
    label: 'Roller Skates',
    emoji: '🛼',
    speedKmh: 16,
    costPerKmINR: 35, // elbow pads & emergency band-aids
    isAbsurd: true,
    chaosFactor: 60,
    practicalityRating: 4.0,
    notes: 'Retro vibe! Terrifying when encountering any mild downhill slope.',
    accentColor: '#8b5cf6', // purple
  },
  {
    id: 'zipline',
    label: 'Zipline',
    emoji: '🪢',
    speedKmh: 95,
    costPerKmINR: 2400, // industrial steel cables & municipal permits
    isAbsurd: true,
    chaosFactor: 92,
    practicalityRating: 1.0,
    straightLineOnly: true,
    notes: 'Direct straight line! Ignores roads, buildings, and municipal bylaws.',
    accentColor: '#eab308', // yellow
  },
  {
    id: 'shoppingcart',
    label: 'Shopping Cart',
    emoji: '🛒',
    speedKmh: 20,
    costPerKmINR: 20, // quarter deposit (refundable if you survive)
    isAbsurd: true,
    chaosFactor: 88,
    practicalityRating: 2.5,
    notes: 'One squeaky front wheel spins out of control. Zero braking mechanism.',
    accentColor: '#64748b', // slate
  },
];
