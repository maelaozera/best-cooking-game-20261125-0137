// Semua angka tuning, warna, dan letak elemen Dapur Kilat dalam satu tempat.
// Area main adalah 1280x720 piksel logis; renderer menyesuaikannya ke ukuran jendela,
// jadi tidak ada aturan di bawah ini yang bergantung pada ukuran layar.

export const FIELD = { width: 1280, height: 720 };

/** Langkah simulasi tetap, dalam detik: 60 update per detik apa pun laju layarnya. */
export const STEP = 1 / 60;

/** Nyawa awal: tiga pesanan gagal (salah saji atau kedaluwarsa) mengakhiri shift. */
export const LIVES = 3;

/** Panjang satu shift, dalam detik. Habisnya shift menutup permainan dengan skor akhir. */
export const SHIFT_SECONDS = 150;

/** Berapa hidangan tersaji untuk naik satu level. */
export const SERVED_PER_LEVEL = 4;

/** Level tertinggi: kecepatan dan tekanan berhenti naik di sini. */
export const MAX_LEVEL = 10;

/** Pesanan: jeda kemunculan awal, batas waktu awal, dan seberapa cepat keduanya mengetat. */
export const ORDER = {
  spawnInterval: 13,
  spawnMin: 6,
  spawnPerLevel: 0.9,
  timeLimit: 55,
  timeMin: 32,
  timePerLevel: 2.2,
  maxActive: 3,
};

/** Stasiun olah: patty matang dalam hitungan detik; tomat dan bawang butuh dua cincangan. */
export const PREP = {
  grillSeconds: 4,
  burnSeconds: 6,
  chopsNeeded: 2,
  grillSlots: 2,
};

/** Piring rakitan menampung paling banyak lima bahan. */
export const PLATE_MAX = 5;

/** Skor: nilai dasar per hidangan, bonus per detik tersisa, dan bonus combo per tingkat. */
export const SCORE = {
  base: 100,
  perSecondLeft: 5,
  perCombo: 15,
  coinBase: 10,
};

// ---------------------------------------------------------------------------
// Tata letak (koordinat logis 1280x720). Dipakai renderer, penangan klik, dan
// adegan screenshot, jadi satu perubahan di sini menggerakkan ketiganya.
// ---------------------------------------------------------------------------

export const LAYOUT = {
  header: { x: 0, y: 0, width: 1280, height: 64 },
  // Papan pesanan: kolom kiri, tiga tiket bertumpuk.
  board: { x: 20, y: 80, width: 252, height: 480 },
  ticketHeight: 112,
  ticketGap: 12,
  // Dapur tengah: panggangan dan talenan di atas, piring rakitan di bawahnya.
  grill: { x: 300, y: 84, width: 320, height: 124 },
  grillSlots: [
    { x: 322, y: 102, width: 132, height: 88 },
    { x: 466, y: 102, width: 132, height: 88 },
  ],
  boardStation: { x: 640, y: 84, width: 320, height: 124 },
  chopArea: { x: 662, y: 102, width: 276, height: 88 },
  plate: { x: 300, y: 228, width: 660, height: 242, cx: 630, cy: 356, rx: 268, ry: 96 },
  serveButton: { x: 560, y: 492, width: 220, height: 58 },
  trashButton: { x: 800, y: 492, width: 140, height: 58 },
  // Kolom kanan: jendela koki dan panel statistik.
  chef: { x: 984, y: 84, width: 276, height: 216 },
  stats: { x: 984, y: 316, width: 276, height: 154 },
  tips: { x: 20, y: 486, width: 252, height: 74 },
  // Rak bahan: strip bawah, enam tempat bahan.
  bins: { y: 584, height: 112, gap: 8, firstX: 20, width: 200 },
};

export const PALETTE = {
  wall: '#f6e3c2',
  wallTile: '#efd9ae',
  floor: '#8a5a33',
  floorDark: '#744a28',
  counter: '#b07a45',
  counterEdge: '#8a5a33',
  steel: '#c9ced6',
  steelDark: '#9aa1ad',
  boardWood: '#d9a066',
  plate: '#fdfdf8',
  plateRim: '#d7d2c4',
  header: '#3d2b1f',
  headerText: '#ffe9c4',
  ticket: '#fff8e7',
  ticketEdge: '#e0c48f',
  text: '#2e2118',
  muted: '#7a6a58',
  good: '#2e9e5b',
  warn: '#e8a13a',
  bad: '#d64541',
  accent: '#e8643c',
  accentDark: '#c24e2c',
  gold: '#f2c94c',
  serve: '#2e9e5b',
  serveReady: '#37b96c',
  trash: '#8a5a33',
  overlay: 'rgba(46, 33, 24, 0.72)',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Tempat skor terbaik disimpan antar kunjungan (browser ini saja). */
export const BEST_KEY = 'dapur-kilat.best';
