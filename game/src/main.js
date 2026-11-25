// Boot dan satu loop: input dibaca tiap frame, dunia maju dalam langkah tetap
// 1/60 detik (beberapa langkah dalam frame yang lambat, tidak ada dalam frame yang
// cepat), dan renderer melukis apa yang ada. Permainan berpindah di antara empat
// layar: judul, main, jeda, dan selesai.
//
// ?seed=N menetapkan pola pesanan. ?shot=start|play|serve|end (dengan &seed=N)
// menggelar adegan itu alih-alih menjalankan loop, melukisnya dua kali, lalu
// menandai window.__shotReady untuk screenshot.
import { BEST_KEY, STEP } from './config.js';
import { createRandom } from './random.js';
import { createWorld, EVENT_EXPIRED, EVENT_OVER, EVENT_SERVED, EVENT_WRONG } from './world.js';
import { ACTION_CONFIRM, ACTION_PAUSE, ACTION_TRASH, createInput } from './input.js';
import { createRenderer, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { stageShot } from './shots.js';

/** Frame terpanjang yang dikejar loop; jeda yang lebih panjang (tab tersembunyi) dibuang. */
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
const renderer = createRenderer(canvas);
// Handle baca-saja untuk pengujian otomatis (konsol / Playwright).
window.__dapurKilat = { world, get state() { return world.state; } };

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Penyimpanan bisa mati (jendela privat): skor terbaik lalu hanya bertahan kunjungan ini.
  }
}

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world.state, scene.screen, scene.best);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas, (x, y) => {
    if (screen === SCREEN_PLAY) {
      world.clickAt(x, y);
    } else if (screen === SCREEN_TITLE || screen === SCREEN_OVER) {
      startGame();
    } else if (screen === SCREEN_PAUSED) {
      screen = SCREEN_PLAY;
      announce('Bermain.');
    }
  });
  let screen = SCREEN_TITLE;
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();

  // Pembaca layar (dan siapa pun yang membaca teks halaman) mendengar pergantian layar.
  function announce(message) {
    status.textContent = message;
  }

  function startGame() {
    world.reset();
    accumulator = 0;
    screen = SCREEN_PLAY;
    announce(`Bermain. ${world.state.lives} nyawa. Shift ${Math.floor(world.state.shiftLeft / 60)} menit.`);
  }

  function endGame() {
    screen = SCREEN_OVER;
    if (world.state.score > best) {
      best = world.state.score;
      saveBest(best);
    }
    announce(`Selesai. Skor ${world.state.score}. Terbaik ${best}.`);
  }

  function handleActions() {
    const actions = input.takeActions();
    const bin = input.takeBin();
    if (bin >= 0 && screen === SCREEN_PLAY) {
      const centre = world.binCentre(bin);
      world.clickAt(centre.x, centre.y);
    }
    if (actions & ACTION_TRASH && screen === SCREEN_PLAY) {
      const centre = world.trashCentre();
      world.clickAt(centre.x, centre.y);
    }
    if (actions & ACTION_CONFIRM && (screen === SCREEN_TITLE || screen === SCREEN_OVER)) startGame();
    else if (actions & ACTION_CONFIRM && screen === SCREEN_PLAY) {
      // Spasi saat bermain berarti sajikan; klik mouse sudah ditangani pointer.
      const centre = world.serveCentre();
      world.clickAt(centre.x, centre.y);
    } else if (actions & ACTION_PAUSE && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Jeda.');
    } else if (actions & (ACTION_PAUSE | ACTION_CONFIRM) && screen === SCREEN_PAUSED) {
      screen = SCREEN_PLAY;
      announce('Bermain.');
    }
  }

  function step() {
    if (screen === SCREEN_TITLE) {
      world.step(STEP, true);
      return;
    }
    const events = world.step(STEP, false);
    if (events & EVENT_OVER) endGame();
    else if (events & EVENT_SERVED) announce(`Tersaji! Skor ${world.state.score}.`);
    else if (events & EVENT_WRONG) announce(`Salah racikan. ${world.state.lives} nyawa tersisa.`);
    else if (events & EVENT_EXPIRED) announce(`Pesanan kedaluwarsa. ${world.state.lives} nyawa tersisa.`);
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    handleActions();
    if (screen === SCREEN_TITLE || screen === SCREEN_PLAY) {
      while (accumulator >= STEP && (screen === SCREEN_TITLE || screen === SCREEN_PLAY)) {
        step();
        accumulator -= STEP;
      }
    } else {
      accumulator = 0;
    }
    renderer.draw(world.state, screen, best);
  }

  // Meninggalkan tab menjeda permainan yang berjalan, bukan membiarkan pesanan kedaluwarsa tanpa terlihat.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Jeda.');
    }
  });

  announce('Dapur Kilat. Tekan Spasi atau klik untuk mulai.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
