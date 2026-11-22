// Layout and tuning for The Orchid Hour.
// One screen, three routes, two keepers and two glass eyes, one prize.

export const VIEW = { w: 960, h: 600 };

export const ROOM = { x: 28, y: 88, w: 904, h: 452 };

export const PALETTE = {
  night: '#0b1020',
  floor: '#141c31',
  floorAlt: '#18223a',
  brass: '#c9a35b',
  brassDim: '#6f5c37',
  teal: '#3f8f83',
  tealDark: '#173b3c',
  gold: '#f5c763',
  danger: '#ff5c62',
  dangerDim: '#7c2f3a',
  ink: '#070b16',
  paper: '#e9e2cf',
  cyan: '#8ce6e0',
};

// Solid furniture. Blocks movement and sight.
export const BLOCKERS = [
  { x: 132, y: 132, w: 118, h: 58, kind: 'crate' },
  { x: 132, y: 300, w: 118, h: 58, kind: 'crate' },
  { x: 356, y: 292, w: 108, h: 76, kind: 'plinth' },
  { x: 452, y: 126, w: 104, h: 58, kind: 'bench' },
  { x: 642, y: 330, w: 128, h: 68, kind: 'crate' },
  { x: 706, y: 126, w: 148, h: 42, kind: 'bench' },
];

// Walls that split the gallery into three lanes. Passages are the gaps.
export const WALLS = [
  { x1: 306, y1: 88, x2: 306, y2: 296 },
  { x1: 306, y1: 404, x2: 306, y2: 540 },
  { x1: 606, y1: 88, x2: 606, y2: 262 },
  { x1: 606, y1: 372, x2: 606, y2: 540 },
];

// Shadow cover. Sight still works here, but much more slowly.
export const SHADOWS = [
  { x: 96, y: 200, w: 170, h: 84 },
  { x: 330, y: 396, w: 150, h: 96 },
  { x: 470, y: 202, w: 124, h: 78 },
  { x: 676, y: 420, w: 186, h: 86 },
  { x: 62, y: 452, w: 124, h: 72 },
];

export const THIEF_START = { x: 112, y: 500 };
export const LOOT = { x: 836, y: 208 };
export const EXIT = { x: 62, y: 500, r: 30 };

export const KEEPERS = [
  {
    id: 'north-keeper',
    from: { x: 180, y: 128 },
    to: { x: 180, y: 452 },
    speed: 62,
    range: 168,
    half: 0.43,
    sweep: 0.16,
    pause: 0.7,
  },
  {
    id: 'gallery-keeper',
    from: { x: 352, y: 184 },
    to: { x: 560, y: 184 },
    speed: 70,
    range: 178,
    half: 0.38,
    sweep: 0.2,
    pause: 0.5,
  },
  {
    id: 'vault-keeper',
    from: { x: 830, y: 454 },
    to: { x: 830, y: 170 },
    speed: 66,
    range: 166,
    half: 0.41,
    sweep: 0.18,
    pause: 0.6,
  },
];

export const EYES = [
  {
    id: 'arch-eye',
    x: 332,
    y: 92,
    base: Math.PI / 2,
    sweep: 0.95,
    speed: 0.66,
    range: 196,
    half: 0.26,
  },
  {
    id: 'vault-eye',
    x: 928,
    y: 314,
    base: Math.PI,
    sweep: 0.82,
    speed: 0.58,
    range: 186,
    half: 0.25,
  },
];

export const RULES = {
  walkSpeed: 158,
  crouchSpeed: 82,
  alarmDecay: 3.6,
  decoyAlarm: 6,
  veilAlarm: 8,
  stealAlarm: 10,
  getawaySeconds: 20,
  decoyCharges: 2,
  veilCharges: 2,
  shadowFactor: 0.34,
  crouchFactor: 0.55,
};

export function clamp(value, low, high) {
  return Math.max(low, Math.min(high, value));
}
