// Semua gambar Dapur Kilat: dapur, papan pesanan, stasiun olah, piring rakitan,
// rak bahan, dan keempat layar (judul, main, jeda, selesai). Semuanya digambar
// dengan bentuk kanvas — tidak ada aset luar, tidak ada permintaan jaringan.

import { FIELD, LAYOUT, PALETTE, FONT } from './config.js';
import { BIN_ORDER, INGREDIENTS } from './recipes.js';

export const SCREEN_TITLE = 0;
export const SCREEN_PLAY = 1;
export const SCREEN_PAUSED = 2;
export const SCREEN_OVER = 3;

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function text(ctx, value, x, y, size, color, weight, align) {
  ctx.fillStyle = color;
  ctx.font = `${weight ?? 700} ${size}px ${FONT}`;
  ctx.textAlign = align ?? 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(value, x, y);
}

function formatTime(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${minutes}:${rest < 10 ? '0' : ''}${rest}`;
}

/** Ikon satu bahan, digambar sebagai bentuk vektor di tengah (x, y) dengan jari-jari r. */
export function drawIngredient(ctx, id, x, y, r) {
  const ingredient = INGREDIENTS[id];
  ctx.save();
  ctx.translate(x, y);
  if (id === 'bun') {
    ctx.fillStyle = ingredient.color;
    ctx.beginPath();
    ctx.arc(0, r * 0.1, r, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = ingredient.dark;
    ctx.fillRect(-r, r * 0.1, r * 2, r * 0.35);
    ctx.fillStyle = '#fff3d6';
    for (const [dx, dy] of [[-r * 0.45, -r * 0.45], [0, -r * 0.65], [r * 0.45, -r * 0.45]]) {
      ctx.beginPath();
      ctx.ellipse(dx, dy, r * 0.12, r * 0.07, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'patty') {
    ctx.fillStyle = ingredient.color;
    roundRect(ctx, -r, -r * 0.55, r * 2, r * 1.1, r * 0.5);
    ctx.fill();
    ctx.fillStyle = ingredient.dark;
    for (const [dx, dy] of [[-r * 0.5, 0], [0, -r * 0.2], [r * 0.5, r * 0.15], [-r * 0.1, r * 0.25]]) {
      ctx.beginPath();
      ctx.arc(dx, dy, r * 0.12, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'cheese') {
    ctx.fillStyle = ingredient.color;
    ctx.beginPath();
    ctx.moveTo(-r, r * 0.6);
    ctx.lineTo(r, r * 0.6);
    ctx.lineTo(0, -r * 0.8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = ingredient.dark;
    for (const [dx, dy] of [[-r * 0.3, r * 0.3], [r * 0.25, r * 0.35]]) {
      ctx.beginPath();
      ctx.arc(dx, dy, r * 0.13, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'lettuce') {
    ctx.fillStyle = ingredient.color;
    for (let angle = 0; angle < 6; angle += 1) {
      const a = (angle / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, r * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = ingredient.dark;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'tomato') {
    ctx.fillStyle = ingredient.color;
    ctx.beginPath();
    ctx.arc(0, r * 0.1, r * 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3d8b40';
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.8);
    ctx.lineTo(-r * 0.35, -r * 0.35);
    ctx.lineTo(0, -r * 0.5);
    ctx.lineTo(r * 0.35, -r * 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.arc(-r * 0.35, -r * 0.25, r * 0.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'onion') {
    ctx.fillStyle = '#f4eef7';
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = ingredient.dark;
    ctx.lineWidth = r * 0.12;
    for (const radius of [0.62, 0.32]) {
      ctx.beginPath();
      ctx.arc(0, 0, r * radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = '#7fc46a';
    ctx.beginPath();
    ctx.moveTo(-r * 0.25, -r);
    ctx.lineTo(0, -r * 1.25);
    ctx.lineTo(r * 0.25, -r);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawHeart(ctx, x, y, size, filled) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 20, size / 20);
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.bezierCurveTo(-11, -4, -6, -12, 0, -6);
  ctx.bezierCurveTo(6, -12, 11, -4, 0, 6);
  ctx.closePath();
  ctx.fillStyle = filled ? '#e5534b' : 'rgba(255,255,255,0.25)';
  ctx.fill();
  ctx.restore();
}

function drawTicket(ctx, order, x, y, width, height) {
  ctx.fillStyle = PALETTE.ticket;
  roundRect(ctx, x, y, width, height, 12);
  ctx.fill();
  ctx.strokeStyle = PALETTE.ticketEdge;
  ctx.lineWidth = 2;
  ctx.stroke();
  const recipe = order.recipe;
  text(ctx, `#${order.id}  ${recipe.name}`, x + 14, y + 22, 19, PALETTE.text, 800);
  const fresh = order.fresh > 0;
  text(ctx, fresh ? 'BARU!' : formatTime(order.timeLeft), x + width - 14, y + 22, 18, fresh ? PALETTE.accent : PALETTE.text, 800, 'right');
  // Deret bahan yang diminta, sebagai ikon kecil berlabel jumlah.
  const counts = new Map();
  for (const item of recipe.ingredients) counts.set(item, (counts.get(item) ?? 0) + 1);
  let iconX = x + 30;
  for (const [id, count] of counts) {
    drawIngredient(ctx, id, iconX, y + 62, 17);
    if (count > 1) text(ctx, `x${count}`, iconX + 16, y + 74, 14, PALETTE.text, 800);
    iconX += 52;
  }
  // Bilah waktu pesanan: hijau ke merah seiring habis.
  const ratio = Math.max(0, order.timeLeft / order.timeMax);
  const barX = x + 14;
  const barY = y + height - 20;
  const barWidth = width - 28;
  ctx.fillStyle = '#e8dcc4';
  roundRect(ctx, barX, barY, barWidth, 10, 5);
  ctx.fill();
  ctx.fillStyle = ratio > 0.5 ? PALETTE.good : ratio > 0.25 ? PALETTE.warn : PALETTE.bad;
  if (ratio > 0) {
    roundRect(ctx, barX, barY, barWidth * ratio, 10, 5);
    ctx.fill();
  }
}

function drawGrill(ctx, state, elapsed) {
  const area = LAYOUT.grill;
  ctx.fillStyle = PALETTE.counter;
  roundRect(ctx, area.x, area.y, area.width, area.height, 12);
  ctx.fill();
  text(ctx, 'PANGGANGAN', area.x + 16, area.y + 16, 13, '#fff', 800);
  state.grill.forEach((slot, index) => {
    const rect = LAYOUT.grillSlots[index];
    ctx.fillStyle = '#3a3f47';
    roundRect(ctx, rect.x, rect.y, rect.width, rect.height, 10);
    ctx.fill();
    ctx.strokeStyle = '#565d68';
    ctx.lineWidth = 3;
    for (let bar = 1; bar < 4; bar += 1) {
      const bx = rect.x + (rect.width / 4) * bar;
      ctx.beginPath();
      ctx.moveTo(bx, rect.y + 6);
      ctx.lineTo(bx, rect.y + rect.height - 6);
      ctx.stroke();
    }
    if (slot.ingredient !== null) {
      drawIngredient(ctx, slot.ingredient, rect.x + rect.width / 2, rect.y + rect.height / 2 - 6, 26);
      if (slot.burned) {
        text(ctx, 'GOSONG! KLIK BUANG', rect.x + rect.width / 2, rect.y + rect.height - 12, 12, '#ff9d8a', 800, 'center');
      } else if (slot.done) {
        const pulse = 0.65 + 0.35 * Math.sin(elapsed * 6);
        ctx.fillStyle = `rgba(46, 158, 91, ${pulse.toFixed(2)})`;
        roundRect(ctx, rect.x + 6, rect.y + rect.height - 22, rect.width - 12, 18, 9);
        ctx.fill();
        text(ctx, 'MATANG! KLIK AMBIL', rect.x + rect.width / 2, rect.y + rect.height - 13, 12, '#fff', 800, 'center');
      } else {
        const barWidth = rect.width - 20;
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        roundRect(ctx, rect.x + 10, rect.y + rect.height - 16, barWidth, 8, 4);
        ctx.fill();
        ctx.fillStyle = PALETTE.warn;
        roundRect(ctx, rect.x + 10, rect.y + rect.height - 16, barWidth * slot.progress, 8, 4);
        ctx.fill();
      }
    } else {
      text(ctx, 'kosong', rect.x + rect.width / 2, rect.y + rect.height / 2, 14, '#7d838d', 600, 'center');
    }
  });
}

function drawBoardStation(ctx, state) {
  const area = LAYOUT.boardStation;
  ctx.fillStyle = PALETTE.counter;
  roundRect(ctx, area.x, area.y, area.width, area.height, 12);
  ctx.fill();
  text(ctx, 'TALENAN — KLIK UNTUK MENCINCANG', area.x + 16, area.y + 16, 13, '#fff', 800);
  const rect = LAYOUT.chopArea;
  ctx.fillStyle = PALETTE.boardWood;
  roundRect(ctx, rect.x, rect.y, rect.width, rect.height, 10);
  ctx.fill();
  ctx.strokeStyle = '#b97e2e';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Pisau di sisi talenan.
  ctx.fillStyle = PALETTE.steel;
  ctx.beginPath();
  ctx.moveTo(rect.x + rect.width - 52, rect.y + 14);
  ctx.lineTo(rect.x + rect.width - 18, rect.y + 14);
  ctx.lineTo(rect.x + rect.width - 18, rect.y + 30);
  ctx.lineTo(rect.x + rect.width - 52, rect.y + 30);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#5a4632';
  ctx.fillRect(rect.x + rect.width - 58, rect.y + 16, 8, 12);
  if (state.board !== null) {
    const board = state.board;
    drawIngredient(ctx, board.ingredient, rect.x + 58, rect.y + rect.height / 2, 26);
    if (board.chopsLeft > 0) {
      text(ctx, `Cincang ${2 - board.chopsLeft}/2 — klik lagi!`, rect.x + 178, rect.y + rect.height / 2, 14, PALETTE.text, 800, 'center');
    } else {
      text(ctx, 'Sudah dicincang!', rect.x + 178, rect.y + rect.height / 2, 14, PALETTE.good, 800, 'center');
    }
  } else {
    text(ctx, 'kosong — klik Tomat / Bawang di rak', rect.x + 20, rect.y + rect.height / 2, 15, '#8a6a42', 600);
  }
}

function drawPlate(ctx, state, ready) {
  const plate = LAYOUT.plate;
  // Meja rakitan.
  ctx.fillStyle = PALETTE.counter;
  roundRect(ctx, plate.x, plate.y, plate.width, plate.height, 12);
  ctx.fill();
  text(ctx, 'PIRING RAKITAN', plate.x + 16, plate.y + 18, 13, '#fff', 800);
  // Piring putih dengan pinggiran.
  ctx.fillStyle = PALETTE.plateRim;
  ctx.beginPath();
  ctx.ellipse(plate.cx, plate.cy, plate.rx, plate.ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.plate;
  ctx.beginPath();
  ctx.ellipse(plate.cx, plate.cy, plate.rx - 12, plate.ry - 11, 0, 0, Math.PI * 2);
  ctx.fill();
  if (state.plate.length === 0) {
    text(ctx, 'Klik bahan di rak bawah untuk merakit hidangan', plate.cx, plate.cy, 16, PALETTE.muted, 600, 'center');
  } else {
    const gap = Math.min(96, (plate.rx * 2 - 80) / state.plate.length);
    const startX = plate.cx - (gap * (state.plate.length - 1)) / 2;
    state.plate.forEach((id, index) => {
      drawIngredient(ctx, id, startX + gap * index, plate.cy - 4, 30);
      text(ctx, INGREDIENTS[id].name, startX + gap * index, plate.cy + 52, 13, PALETTE.text, 700, 'center');
    });
  }
  if (ready) {
    text(ctx, 'SIAP DISAJIKAN!', plate.cx, plate.y + plate.height - 16, 18, PALETTE.good, 800, 'center');
  }
}

function drawServeRow(ctx, state, ready, elapsed) {
  const serve = LAYOUT.serveButton;
  const trash = LAYOUT.trashButton;
  if (ready) {
    const pulse = 0.5 + 0.5 * Math.sin(elapsed * 5);
    ctx.fillStyle = `rgba(55, 185, 108, ${0.25 + 0.3 * pulse})`;
    roundRect(ctx, serve.x - 8, serve.y - 8, serve.width + 16, serve.height + 16, 16);
    ctx.fill();
  }
  ctx.fillStyle = ready ? PALETTE.serveReady : PALETTE.serve;
  roundRect(ctx, serve.x, serve.y, serve.width, serve.height, 12);
  ctx.fill();
  text(ctx, ready ? 'SAJIKAN!  (Spasi)' : 'SAJIKAN  (Spasi)', serve.x + serve.width / 2, serve.y + serve.height / 2, 20, '#fff', 800, 'center');
  ctx.fillStyle = PALETTE.trash;
  roundRect(ctx, trash.x, trash.y, trash.width, trash.height, 12);
  ctx.fill();
  text(ctx, 'BUANG  (T)', trash.x + trash.width / 2, trash.y + trash.height / 2, 18, '#fff', 800, 'center');
}

function drawBins(ctx) {
  const bins = LAYOUT.bins;
  BIN_ORDER.forEach((id, index) => {
    const ingredient = INGREDIENTS[id];
    const x = bins.firstX + index * (bins.width + bins.gap);
    const y = bins.y;
    ctx.fillStyle = '#fff8e7';
    roundRect(ctx, x, y, bins.width, bins.height, 12);
    ctx.fill();
    ctx.strokeStyle = ingredient.dark;
    ctx.lineWidth = 2;
    ctx.stroke();
    drawIngredient(ctx, id, x + 42, y + 40, 26);
    text(ctx, ingredient.name, x + 78, y + 28, 18, PALETTE.text, 800);
    text(ctx, ingredient.prepLabel, x + 78, y + 54, 14, PALETTE.muted, 700);
    ctx.fillStyle = PALETTE.header;
    roundRect(ctx, x + bins.width - 40, y + 10, 30, 30, 8);
    ctx.fill();
    text(ctx, ingredient.key, x + bins.width - 25, y + 26, 17, '#ffe9c4', 800, 'center');
    text(ctx, 'Klik atau tekan tombol angka', x + bins.width / 2, y + bins.height - 16, 12, PALETTE.muted, 600, 'center');
  });
}

function drawChef(ctx, state) {
  const area = LAYOUT.chef;
  ctx.fillStyle = '#7fb3d5';
  roundRect(ctx, area.x, area.y, area.width, area.height, 12);
  ctx.fill();
  ctx.fillStyle = '#fff';
  roundRect(ctx, area.x + 8, area.y + 8, area.width - 16, area.height - 16, 8);
  ctx.fill();
  text(ctx, 'JENDELA KOKI', area.x + 16, area.y + 22, 13, PALETTE.muted, 800);
  // Koki: topi, wajah, senyum, dan celemek.
  const cx = area.x + area.width / 2;
  const cy = area.y + 108;
  // Topi koki krem (bukan putih, agar terlihat di latar jendela yang putih).
  ctx.fillStyle = '#efe6cf';
  ctx.beginPath();
  ctx.arc(cx - 34, cy - 52, 20, 0, Math.PI * 2);
  ctx.arc(cx, cy - 62, 24, 0, Math.PI * 2);
  ctx.arc(cx + 34, cy - 52, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(cx - 48, cy - 62, 96, 22);
  ctx.strokeStyle = '#c9b892';
  ctx.lineWidth = 2;
  ctx.strokeRect(cx - 48, cy - 62, 96, 22);
  ctx.fillStyle = '#f2c9a0';
  ctx.beginPath();
  ctx.arc(cx, cy - 8, 42, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2e2118';
  ctx.beginPath();
  ctx.arc(cx - 16, cy - 14, 4, 0, Math.PI * 2);
  ctx.arc(cx + 16, cy - 14, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2e2118';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy + 2, 18, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  ctx.fillStyle = '#e8643c';
  roundRect(ctx, cx - 46, cy + 36, 92, 34, 10);
  ctx.fill();
  text(ctx, state.combo > 1 ? `Combo x${state.combo}! Terus!` : 'Ayo, cepat masak!', cx, area.y + area.height - 18, 15, PALETTE.text, 800, 'center');
}

function drawStats(ctx, state, best) {
  const area = LAYOUT.stats;
  ctx.fillStyle = PALETTE.ticket;
  roundRect(ctx, area.x, area.y, area.width, area.height, 12);
  ctx.fill();
  ctx.strokeStyle = PALETTE.ticketEdge;
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, 'STATISTIK SHIFT', area.x + 16, area.y + 22, 13, PALETTE.muted, 800);
  text(ctx, `Hidangan tersaji: ${state.served}`, area.x + 16, area.y + 54, 17, PALETTE.text, 700);
  text(ctx, `Combo terbaik: x${state.bestCombo}`, area.x + 16, area.y + 82, 17, PALETTE.text, 700);
  text(ctx, `Skor terbaik: ${Math.max(best, state.score)}`, area.x + 16, area.y + 110, 17, PALETTE.text, 700);
  const toNext = 4 - (state.served % 4);
  text(ctx, state.level >= 10 ? 'Level maks tercapai!' : `${toNext} hidangan lagi naik level ${state.level + 1}`, area.x + 16, area.y + 138, 14, PALETTE.accent, 700);
}

function drawHeader(ctx, state) {
  const header = LAYOUT.header;
  ctx.fillStyle = PALETTE.header;
  ctx.fillRect(header.x, header.y, header.width, header.height);
  text(ctx, 'DAPUR KILAT', 24, 30, 26, PALETTE.headerText, 800);
  text(ctx, 'game memasak', 24, 54, 12, '#cbb79b', 600);
  text(ctx, `Skor ${state.score}`, 330, 34, 20, '#fff', 800);
  text(ctx, `Koin ${state.coins}`, 470, 34, 20, PALETTE.gold, 800);
  text(ctx, `Level ${state.level}`, 600, 34, 20, '#fff', 800);
  const shiftLow = state.shiftLeft <= 30;
  text(ctx, `Shift ${formatTime(state.shiftLeft)}`, 730, 34, 20, shiftLow ? '#ff9d8a' : '#fff', 800);
  for (let index = 0; index < 3; index += 1) {
    drawHeart(ctx, 940 + index * 34, 34, 24, index < state.lives);
  }
  text(ctx, 'P = jeda', 1080, 34, 15, '#cbb79b', 600);
  text(ctx, 'T = buang', 1170, 34, 15, '#cbb79b', 600);
}

function drawBoard(ctx, state) {
  const board = LAYOUT.board;
  state.orders.forEach((order, index) => {
    const y = board.y + index * (LAYOUT.ticketHeight + LAYOUT.ticketGap);
    drawTicket(ctx, order, board.x, y, board.width, LAYOUT.ticketHeight);
  });
  for (let index = state.orders.length; index < 3; index += 1) {
    const y = board.y + index * (LAYOUT.ticketHeight + LAYOUT.ticketGap);
    ctx.strokeStyle = 'rgba(122, 106, 88, 0.5)';
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 2;
    roundRect(ctx, board.x, y, board.width, LAYOUT.ticketHeight, 12);
    ctx.stroke();
    ctx.setLineDash([]);
    text(ctx, 'Menunggu pesanan…', board.x + board.width / 2, y + LAYOUT.ticketHeight / 2, 15, PALETTE.muted, 600, 'center');
  }
  const tips = LAYOUT.tips;
  ctx.fillStyle = '#fff8e7';
  roundRect(ctx, tips.x, tips.y, tips.width, tips.height, 12);
  ctx.fill();
  text(ctx, 'Cara main:', tips.x + 14, tips.y + 18, 14, PALETTE.text, 800);
  text(ctx, '1-6 pilih bahan · klik stasiun', tips.x + 14, tips.y + 40, 13, PALETTE.muted, 600);
  text(ctx, 'untuk olah · Spasi sajikan', tips.x + 14, tips.y + 58, 13, PALETTE.muted, 600);
}

function drawMessage(ctx, state) {
  if (state.messageT <= 0 || state.message === '') return;
  const colors = { good: '#7fd6a4', bad: '#ff9d8a', warn: '#ffd28a', info: '#ffe9c4' };
  const color = colors[state.messageKind] ?? colors.info;
  ctx.font = `800 14px ${FONT}`;
  const width = ctx.measureText(state.message).width + 36;
  const x = (FIELD.width - width) / 2;
  const y = 556;
  ctx.fillStyle = 'rgba(46, 33, 24, 0.88)';
  roundRect(ctx, x, y, width, 26, 13);
  ctx.fill();
  text(ctx, state.message, FIELD.width / 2, y + 14, 14, color, 800, 'center');
}

function drawBackground(ctx) {
  // Dinding ubin hangat di atas, lantai kayu di bawah.
  ctx.fillStyle = PALETTE.wall;
  ctx.fillRect(0, 64, FIELD.width, 520);
  ctx.strokeStyle = PALETTE.wallTile;
  ctx.lineWidth = 2;
  for (let y = 96; y < 584; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(FIELD.width, y);
    ctx.stroke();
  }
  for (let x = 32; x < FIELD.width; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 64);
    ctx.lineTo(x, 584);
    ctx.stroke();
  }
  ctx.fillStyle = PALETTE.floor;
  ctx.fillRect(0, 584, FIELD.width, 136);
  ctx.strokeStyle = PALETTE.floorDark;
  ctx.lineWidth = 3;
  for (let y = 616; y < 720; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(FIELD.width, y);
    ctx.stroke();
  }
}

function drawOverlay(ctx, lines, accent) {
  ctx.fillStyle = PALETTE.overlay;
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  let y = 210;
  for (const line of lines) {
    text(ctx, line.value, FIELD.width / 2, y, line.size, line.color ?? '#fff', line.weight ?? 700, 'center');
    y += line.gap ?? 44;
  }
  if (accent) text(ctx, accent, FIELD.width / 2, y + 20, 18, PALETTE.gold, 700, 'center');
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');

  function fitCanvas() {
    const scale = Math.min(
      canvas.clientWidth / FIELD.width,
      canvas.clientHeight / FIELD.height,
    );
    const width = Math.floor(FIELD.width * scale);
    const height = Math.floor(FIELD.height * scale);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
  }

  function draw(state, screen, best) {
    fitCanvas();
    drawBackground(ctx);
    drawHeader(ctx, state);
    drawBoard(ctx, state);
    drawGrill(ctx, state, state.elapsed);
    drawBoardStation(ctx, state);
    const ready = state.plate.length > 0 && state.orders.some((order) => {
      const counts = new Map();
      for (const item of order.recipe.ingredients) counts.set(item, (counts.get(item) ?? 0) + 1);
      const plate = new Map();
      for (const item of state.plate) plate.set(item, (plate.get(item) ?? 0) + 1);
      if (counts.size !== plate.size) return false;
      for (const [id, count] of counts) if ((plate.get(id) ?? 0) !== count) return false;
      return true;
    });
    drawPlate(ctx, state, ready);
    drawServeRow(ctx, state, ready, state.elapsed);
    drawChef(ctx, state);
    drawStats(ctx, state, best);
    drawBins(ctx);
    drawMessage(ctx, state);

    if (screen === SCREEN_TITLE) {
      drawOverlay(ctx, [
        { value: 'DAPUR KILAT', size: 64, color: PALETTE.gold, weight: 800, gap: 70 },
        { value: 'Rakit pesanan, panggang patty, cincang sayur — sajikan sebelum waktu habis!', size: 20, gap: 36 },
        { value: 'Klik bahan di rak (atau tombol 1-6) · klik panggangan & talenan untuk mengolah', size: 18, color: '#e8dcc4', gap: 32 },
        { value: 'Spasi = sajikan · T = buang piring · P = jeda', size: 18, color: '#e8dcc4', gap: 48 },
        { value: 'Klik atau tekan Spasi untuk mulai', size: 24, color: '#fff', weight: 800 },
      ], best > 0 ? `Skor terbaik: ${best}` : null);
    } else if (screen === SCREEN_PAUSED) {
      drawOverlay(ctx, [
        { value: 'JEDA', size: 56, color: PALETTE.gold, weight: 800, gap: 60 },
        { value: 'Tekan P atau klik untuk melanjutkan', size: 20 },
      ]);
    } else if (screen === SCREEN_OVER) {
      const title = state.overReason === 'shift' ? 'SHIFT SELESAI!' : 'NYAWA HABIS!';
      const subtitle = state.overReason === 'shift'
        ? 'Dapur tutup. Kerja bagus, koki!'
        : 'Tiga pelanggan kecewa. Coba lagi, koki!';
      drawOverlay(ctx, [
        { value: title, size: 56, color: PALETTE.gold, weight: 800, gap: 60 },
        { value: subtitle, size: 20, gap: 40 },
        { value: `Skor akhir: ${state.score}`, size: 28, gap: 40 },
        { value: `Hidangan tersaji: ${state.served}  ·  Combo terbaik: x${state.bestCombo}`, size: 20, color: '#e8dcc4', gap: 40 },
        { value: `Skor terbaik: ${Math.max(best, state.score)}`, size: 20, color: '#e8dcc4', gap: 48 },
        { value: 'Tekan Spasi untuk main lagi', size: 22, color: '#fff', weight: 800 },
      ]);
    }
  }

  return { draw };
}
