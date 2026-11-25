// Bahan dan resep Dapur Kilat. Setiap bahan tahu cara olahnya sendiri:
//  - ready: langsung ke piring begitu diklik dari rak.
//  - grill: harus dipanggang dulu di panggangan, lalu diklik untuk dipindah ke piring.
//  - chop: harus dicincang di talenan (dua kali klik), lalu pindah sendiri ke piring.
// Sebuah resep adalah daftar bahan (urutan bebas); piring yang isinya sama persis
// dengan resep sebuah pesanan yang masih terbuka bisa disajikan untuk pesanan itu.

export const INGREDIENTS = {
  bun: {
    id: 'bun',
    name: 'Roti',
    key: '1',
    prep: 'ready',
    prepLabel: 'Siap',
    color: '#e8a94e',
    dark: '#b97e2e',
  },
  patty: {
    id: 'patty',
    name: 'Patty',
    key: '2',
    prep: 'grill',
    prepLabel: 'Panggang',
    color: '#7a4a2b',
    dark: '#54301a',
  },
  cheese: {
    id: 'cheese',
    name: 'Keju',
    key: '3',
    prep: 'ready',
    prepLabel: 'Siap',
    color: '#f2c94c',
    dark: '#d9a41f',
  },
  lettuce: {
    id: 'lettuce',
    name: 'Selada',
    key: '4',
    prep: 'ready',
    prepLabel: 'Siap',
    color: '#5cb85c',
    dark: '#3d8b40',
  },
  tomato: {
    id: 'tomato',
    name: 'Tomat',
    key: '5',
    prep: 'chop',
    prepLabel: 'Cincang',
    color: '#e5534b',
    dark: '#b3322c',
  },
  onion: {
    id: 'onion',
    name: 'Bawang',
    key: '6',
    prep: 'chop',
    prepLabel: 'Cincang',
    color: '#c9a7d6',
    dark: '#9a72ad',
  },
};

/** Urutan rak bahan, dari kiri ke kanan. */
export const BIN_ORDER = ['bun', 'patty', 'cheese', 'lettuce', 'tomato', 'onion'];

export const RECIPES = [
  {
    id: 'burger',
    name: 'Burger Kilat',
    minLevel: 1,
    base: 100,
    ingredients: ['bun', 'patty', 'cheese', 'lettuce'],
  },
  {
    id: 'salad',
    name: 'Salad Segar',
    minLevel: 1,
    base: 100,
    ingredients: ['lettuce', 'tomato', 'onion', 'cheese'],
  },
  {
    id: 'sandwich',
    name: 'Sandwich Keju',
    minLevel: 2,
    base: 120,
    ingredients: ['bun', 'cheese', 'tomato', 'lettuce'],
  },
  {
    id: 'double',
    name: 'Burger Double',
    minLevel: 3,
    base: 150,
    ingredients: ['bun', 'patty', 'patty', 'cheese', 'tomato'],
  },
];

/** Resep-resep yang boleh muncul pada level tertentu. */
export function recipesForLevel(level) {
  return RECIPES.filter((recipe) => recipe.minLevel <= level);
}

/** Dua daftar bahan sama bila isinya sama sebagai multiset (urutan bebas, jumlah dihitung). */
export function sameIngredients(a, b) {
  if (a.length !== b.length) return false;
  const counts = new Map();
  for (const item of a) counts.set(item, (counts.get(item) ?? 0) + 1);
  for (const item of b) {
    const left = counts.get(item) ?? 0;
    if (left === 0) return false;
    counts.set(item, left - 1);
  }
  return true;
}

/** Berapa kali sebuah bahan muncul dalam daftar. */
export function countOf(list, id) {
  let count = 0;
  for (const item of list) if (item === id) count += 1;
  return count;
}
