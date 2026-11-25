// Aturan dan keadaan Dapur Kilat, tanpa gambar dan tanpa browser di dalamnya:
// pesanan di papan, rak bahan, panggangan, talenan, piring rakitan, skor, nyawa,
// level, dan timer shift. step() memajukan satu langkah tetap dan mengembalikan
// kejadian sebagai bit flag, agar pemanggil bisa bereaksi tanpa dunia ini tahu
// soal layar atau suara. Klik masuk lewat clickAt(x, y) dalam koordinat logis.

import {
  FIELD,
  LAYOUT,
  LIVES,
  ORDER,
  PLATE_MAX,
  PREP,
  SCORE,
  SERVED_PER_LEVEL,
  MAX_LEVEL,
  SHIFT_SECONDS,
} from './config.js';
import { BIN_ORDER, INGREDIENTS, RECIPES, recipesForLevel, sameIngredients } from './recipes.js';

export const EVENT_SERVED = 1;
export const EVENT_WRONG = 2;
export const EVENT_EXPIRED = 4;
export const EVENT_OVER = 8;
export const EVENT_LEVELUP = 16;
export const EVENT_BURNED = 32;

function inside(rect, x, y) {
  return x >= rect.x && x < rect.x + rect.width && y >= rect.y && y < rect.y + rect.height;
}

function binRect(index) {
  const bins = LAYOUT.bins;
  return {
    x: bins.firstX + index * (bins.width + bins.gap),
    y: bins.y,
    width: bins.width,
    height: bins.height,
  };
}

export function createWorld(random) {
  const state = {
    score: 0,
    coins: 0,
    served: 0,
    combo: 0,
    bestCombo: 0,
    level: 1,
    lives: LIVES,
    shiftLeft: SHIFT_SECONDS,
    elapsed: 0,
    orders: [],
    plate: [],
    grill: [],
    board: null,
    message: '',
    messageKind: 'info',
    messageT: 0,
    spawnTimer: 0,
    nextOrderId: 1,
    over: false,
    overReason: '',
  };
  for (let index = 0; index < PREP.grillSlots; index += 1) {
    state.grill.push({ ingredient: null, progress: 0, done: false, burned: false, burnT: 0 });
  }

  function say(text, kind) {
    state.message = text;
    state.messageKind = kind ?? 'info';
    state.messageT = 2.2;
  }

  function reset() {
    state.score = 0;
    state.coins = 0;
    state.served = 0;
    state.combo = 0;
    state.bestCombo = 0;
    state.level = 1;
    state.lives = LIVES;
    state.shiftLeft = SHIFT_SECONDS;
    state.elapsed = 0;
    state.orders = [];
    state.plate = [];
    state.board = null;
    state.message = '';
    state.messageKind = 'info';
    state.messageT = 0;
    state.spawnTimer = 2;
    state.nextOrderId = 1;
    state.over = false;
    state.overReason = '';
    for (const slot of state.grill) {
      slot.ingredient = null;
      slot.progress = 0;
      slot.done = false;
      slot.burned = false;
      slot.burnT = 0;
    }
    spawnOrder();
  }

  /** Batas waktu sebuah pesanan pada level sekarang. */
  function orderTimeLimit() {
    return Math.max(
      ORDER.timeMin,
      ORDER.timeLimit - ORDER.timePerLevel * (state.level - 1),
    );
  }

  /** Jeda kemunculan pesanan berikutnya pada level sekarang. */
  function spawnInterval() {
    return Math.max(
      ORDER.spawnMin,
      ORDER.spawnInterval - ORDER.spawnPerLevel * (state.level - 1),
    );
  }

  /**
   * Tambah satu pesanan ke papan. Bila `recipeId` diberikan, resep itu yang dipakai
   * (dipakai adegan screenshot); bila tidak, resep diundi dari yang terbuka di level ini.
   */
  function spawnOrder(recipeId) {
    if (state.orders.length >= ORDER.maxActive) return null;
    const pool = recipesForLevel(state.level);
    let recipe = pool[Math.floor(random() * pool.length)];
    if (recipeId) {
      const forced = RECIPES.find((item) => item.id === recipeId);
      if (forced) recipe = forced;
    }
    const order = {
      id: state.nextOrderId,
      recipe,
      timeLeft: orderTimeLimit(),
      timeMax: orderTimeLimit(),
      fresh: 0.9,
    };
    state.nextOrderId += 1;
    state.orders.push(order);
    return order;
  }

  /** Piring sudah memuat bahan ini sebanyak yang resep mana pun butuhkan? */
  function plateHasEnough(id) {
    let need = 0;
    for (const order of state.orders) {
      let count = 0;
      for (const item of order.recipe.ingredients) if (item === id) count += 1;
      need = Math.max(need, count);
    }
    let have = 0;
    for (const item of state.plate) if (item === id) have += 1;
    return have >= Math.max(need, 1);
  }

  function addToPlate(id) {
    if (state.plate.length >= PLATE_MAX) {
      say('Piring penuh! Sajikan atau buang dulu.', 'warn');
      return false;
    }
    if (plateHasEnough(id)) {
      say(`${INGREDIENTS[id].name} sudah cukup di piring.`, 'warn');
      return false;
    }
    state.plate.push(id);
    return true;
  }

  /** Klik pada rak bahan: bahan siap langsung ke piring, sisanya ke stasiun olahnya. */
  function takeIngredient(id) {
    const ingredient = INGREDIENTS[id];
    if (ingredient.prep === 'ready') return addToPlate(id);
    if (ingredient.prep === 'grill') {
      for (const slot of state.grill) {
        if (slot.ingredient === null) {
          slot.ingredient = id;
          slot.progress = 0;
          slot.done = false;
          slot.burned = false;
          slot.burnT = 0;
          return true;
        }
      }
      say('Panggangan penuh! Ambil dulu yang sudah matang.', 'warn');
      return false;
    }
    if (state.board !== null) {
      say('Talenan masih dipakai! Selesaikan dulu cincangannya.', 'warn');
      return false;
    }
    state.board = { ingredient: id, chopsLeft: PREP.chopsNeeded };
    return true;
  }

  /** Klik pada satu slot panggangan: ambil yang matang, buang yang gosong, atau tunggu. */
  function clickGrillSlot(slot) {
    if (slot.ingredient === null) return;
    if (slot.burned) {
      say('Patty gosong dibuang. Jangan ditinggal terlalu lama!', 'bad');
      slot.ingredient = null;
      slot.progress = 0;
      slot.done = false;
      slot.burned = false;
      slot.burnT = 0;
      return EVENT_BURNED;
    }
    if (!slot.done) {
      say('Belum matang — tunggu sampai berbunyi!', 'info');
      return 0;
    }
    if (addToPlate(slot.ingredient)) {
      slot.ingredient = null;
      slot.progress = 0;
      slot.done = false;
      slot.burnT = 0;
    }
    return 0;
  }

  /** Klik pada talenan: satu cincangan; selesai mencincang, bahan pindah sendiri ke piring. */
  function clickBoard() {
    if (state.board === null) return 0;
    state.board.chopsLeft -= 1;
    if (state.board.chopsLeft > 0) return 0;
    const id = state.board.ingredient;
    state.board = null;
    if (!addToPlate(id)) {
      // Piring penuh: bahan yang sudah dicincang menunggu di talenan.
      state.board = { ingredient: id, chopsLeft: 0 };
      return 0;
    }
    return 0;
  }

  /** Apakah piring saat ini cocok dengan salah satu pesanan yang terbuka? */
  function matchingOrder() {
    for (const order of state.orders) {
      if (sameIngredients(state.plate, order.recipe.ingredients)) return order;
    }
    return null;
  }

  /** Sajikan piring: cocok dengan pesanan berarti poin, tidak cocok berarti satu nyawa. */
  function serve() {
    if (state.plate.length === 0) {
      say('Piring masih kosong — rakit dulu hidangannya.', 'warn');
      return 0;
    }
    const order = matchingOrder();
    if (order === null) {
      state.lives -= 1;
      state.combo = 0;
      state.plate = [];
      say('Salah racikan! Pelanggan kecewa, satu nyawa hilang.', 'bad');
      if (state.lives <= 0) return endGame('lives') | EVENT_WRONG;
      return EVENT_WRONG;
    }
    const timeBonus = Math.round(order.timeLeft) * SCORE.perSecondLeft;
    const comboBonus = state.combo * SCORE.perCombo;
    const gained = order.recipe.base + timeBonus + comboBonus;
    state.score += gained;
    state.coins += SCORE.coinBase + state.level;
    state.served += 1;
    state.combo += 1;
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    state.orders = state.orders.filter((item) => item.id !== order.id);
    state.plate = [];
    say(
      `${order.recipe.name} tersaji! +${gained} poin${state.combo > 1 ? ` (combo x${state.combo})` : ''}`,
      'good',
    );
    let events = EVENT_SERVED;
    const nextLevel = Math.min(MAX_LEVEL, 1 + Math.floor(state.served / SERVED_PER_LEVEL));
    if (nextLevel > state.level) {
      state.level = nextLevel;
      say(`Level ${state.level}! Pesanan datang lebih cepat.`, 'good');
      events |= EVENT_LEVELUP;
    }
    return events;
  }

  function endGame(reason) {
    state.over = true;
    state.overReason = reason;
    return EVENT_OVER;
  }

  function loseLife(reason) {
    state.lives -= 1;
    state.combo = 0;
    say(reason, 'bad');
    if (state.lives <= 0) return endGame('lives');
    return 0;
  }

  /**
   * Satu klik pada koordinat logis (x, y). Mengembalikan bit flag kejadian, seperti step().
   * Dipakai klik mouse sungguhan maupun adegan screenshot yang meniru klik yang sama.
   */
  function clickAt(x, y) {
    if (state.over) return 0;
    for (let index = 0; index < BIN_ORDER.length; index += 1) {
      if (inside(binRect(index), x, y)) {
        takeIngredient(BIN_ORDER[index]);
        return 0;
      }
    }
    for (let index = 0; index < state.grill.length; index += 1) {
      if (inside(LAYOUT.grillSlots[index], x, y)) return clickGrillSlot(state.grill[index]);
    }
    if (inside(LAYOUT.chopArea, x, y)) return clickBoard();
    if (inside(LAYOUT.serveButton, x, y)) return serve();
    if (inside(LAYOUT.trashButton, x, y)) {
      if (state.plate.length === 0) {
        say('Piring sudah kosong.', 'info');
      } else {
        state.plate = [];
        say('Piring dibersihkan.', 'info');
      }
      return 0;
    }
    return 0;
  }

  /** Pusat sebuah tempat bahan, untuk tombol keyboard 1-6. */
  function binCentre(index) {
    const rect = binRect(index);
    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  }

  /** Pusat tombol sajikan / buang, untuk keyboard. */
  function serveCentre() {
    const rect = LAYOUT.serveButton;
    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  }

  function trashCentre() {
    const rect = LAYOUT.trashButton;
    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  }

  function grillCentre(index) {
    const rect = LAYOUT.grillSlots[index];
    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  }

  function boardCentre() {
    const rect = LAYOUT.chopArea;
    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  }

  /**
   * Satu langkah tetap. Dengan `demo` (latar layar judul) pesanan datang dan pergi
   * tanpa nyawa hilang dan tanpa skor: dapur tetap hidup di belakang judul.
   */
  function step(dt, demo) {
    if (state.over) return 0;
    let events = 0;
    state.elapsed += dt;
    if (state.messageT > 0) state.messageT = Math.max(0, state.messageT - dt);

    for (const order of state.orders) {
      if (order.fresh > 0) order.fresh = Math.max(0, order.fresh - dt);
      order.timeLeft -= dt;
    }

    if (!demo) {
      state.shiftLeft -= dt;
      if (state.shiftLeft <= 0) {
        state.shiftLeft = 0;
        return endGame('shift');
      }
    }

    for (const slot of state.grill) {
      if (slot.ingredient === null || slot.done) {
        if (slot.done && !slot.burned) {
          slot.burnT += dt;
          if (slot.burnT >= PREP.burnSeconds) slot.burned = true;
        }
        continue;
      }
      slot.progress += dt / PREP.grillSeconds;
      if (slot.progress >= 1) {
        slot.progress = 1;
        slot.done = true;
        slot.burnT = 0;
        if (!demo) say('Patty matang! Segera ambil dari panggangan.', 'good');
      }
    }

    state.spawnTimer -= dt;
    if (state.spawnTimer <= 0) {
      spawnOrder();
      state.spawnTimer += spawnInterval();
    }

    for (let index = state.orders.length - 1; index >= 0; index -= 1) {
      const order = state.orders[index];
      if (order.timeLeft > 0) continue;
      state.orders.splice(index, 1);
      if (demo) continue;
      events |= EVENT_EXPIRED;
      events |= loseLife(`Pesanan ${order.recipe.name} kedaluwarsa! Satu nyawa hilang.`);
      if (state.over) return events | EVENT_OVER;
    }
    return events;
  }

  reset();
  return {
    state,
    reset,
    step,
    clickAt,
    serve,
    spawnOrder,
    matchingOrder,
    binCentre,
    serveCentre,
    trashCentre,
    grillCentre,
    boardCentre,
  };
}

/** Lebar lapangan, dipakai penguji dan adegan. */
export { FIELD };
