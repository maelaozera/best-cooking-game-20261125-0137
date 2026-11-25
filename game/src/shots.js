// Adegan screenshot di balik ?shot=start|play|serve|end. Setiap adegan memainkan
// aturan sungguhan maju dari dunia baru selama beberapa detik, digerakkan oleh
// klik-klik yang sama dengan yang dipakai pemain (klikAt lewat pusat tiap elemen),
// jadi tiap frame adalah tampilan permainan yang nyata dan benih yang sama selalu
// memberi frame yang sama.
import { STEP } from './config.js';
import { EVENT_OVER } from './world.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

const START_SECONDS = 5;
const PLAY_SECONDS = 24;
const SERVE_SECONDS = 12;
const END_LIMIT_SECONDS = 600;
const SAMPLE = 1 / 60;

/** Majukan dunia selama `seconds`, menjalankan aksi [waktu, fungsi] pada waktunya. */
function runScript(world, script, seconds) {
  let time = 0;
  let next = 0;
  while (time < seconds) {
    while (next < script.length && script[next][0] <= time) {
      script[next][1](world);
      next += 1;
    }
    world.step(STEP, false);
    time += STEP;
  }
  while (next < script.length) {
    script[next][1](world);
    next += 1;
  }
}

function clickBin(world, index) {
  const centre = world.binCentre(index);
  world.clickAt(centre.x, centre.y);
}

function clickGrill(world, index) {
  const centre = world.grillCentre(index);
  world.clickAt(centre.x, centre.y);
}

function clickBoard(world) {
  const centre = world.boardCentre();
  world.clickAt(centre.x, centre.y);
}

function clickServe(world) {
  const centre = world.serveCentre();
  world.clickAt(centre.x, centre.y);
}

/**
 * Atur `world` ke adegan bernama (start, play, serve atau end; nama lain berarti
 * start) dan kembalikan layar yang digambar di atasnya serta skor terbaik yang
 * ditampilkan.
 */
export function stageShot(name, world) {
  world.reset();
  if (name !== 'play' && name !== 'serve' && name !== 'end') {
    for (let index = 0; index < START_SECONDS / STEP; index += 1) world.step(STEP, true);
    return { screen: SCREEN_TITLE, best: 0 };
  }

  if (name === 'end') {
    // Pemain yang tidak pernah menyajikan apa pun: pesanan kedaluwarsa satu demi
    // satu sampai nyawa habis, persis seperti permainan sungguhan yang kalah.
    for (let index = 0; index < END_LIMIT_SECONDS / STEP; index += 1) {
      if (world.step(STEP, false) & EVENT_OVER) break;
    }
    return { screen: SCREEN_OVER, best: world.state.score };
  }

  // Adegan play: dapur di tengah kesibukan — tiga pesanan di papan, satu patty
  // baru matang di panggangan, tomat setengah dicincang di talenan, dan piring
  // berisi tiga bahan (hidangan sedang dirakit, belum lengkap).
  // Indeks rak: 0 roti, 1 patty, 2 keju, 3 selada, 4 tomat, 5 bawang.
  const playScript = [
    [0.5, (w) => w.spawnOrder('burger')],
    [1.0, (w) => w.spawnOrder('salad')],
    [2.0, (w) => clickBin(w, 0)],
    [2.5, (w) => clickBin(w, 2)],
    [3.0, (w) => clickBin(w, 1)],
    [4.0, (w) => clickBin(w, 4)],
    [5.0, (w) => clickBoard(w)],
    [7.5, (w) => clickGrill(w, 0)],
    [19.5, (w) => clickBin(w, 1)],
  ];
  runScript(world, playScript, PLAY_SECONDS);
  if (name === 'play') return { screen: SCREEN_PLAY, best: world.state.score };

  // Adegan serve: panggung baru yang segar — sebuah Burger Kilat lengkap di
  // piring (roti, patty, keju, selada), pesanannya masih punya banyak waktu,
  // satu patty lagi baru matang di panggangan, dan tombol SAJIKAN menyala.
  world.reset();
  const serveScript = [
    [0.5, (w) => w.spawnOrder('burger')],
    [1.0, (w) => clickBin(w, 0)],
    [1.5, (w) => clickBin(w, 1)],
    [2.0, (w) => clickBin(w, 2)],
    [2.5, (w) => clickBin(w, 3)],
    [3.0, (w) => clickBin(w, 4)],
    [3.5, (w) => clickBoard(w)],
    [6.0, (w) => clickGrill(w, 0)],
    [7.0, (w) => clickBin(w, 1)],
  ];
  runScript(world, serveScript, SERVE_SECONDS);
  return { screen: SCREEN_PLAY, best: world.state.score };
}
