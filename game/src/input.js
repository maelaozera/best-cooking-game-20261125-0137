// Keyboard dan pointer. Tombol angka memilih bahan dari rak, Spasi menyajikan,
// T membuang isi piring, P atau Esc menjeda. Klik mouse diteruskan apa adanya ke
// dunia lewat koordinat logis kanvas, jadi klik dan tombol memakai jalur yang sama.

export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_SERVE = 4;
export const ACTION_TRASH = 8;

const CONFIRM = new Set(['Space', 'Enter']);
const PAUSE = new Set(['KeyP', 'Escape']);
const TRASH = new Set(['KeyT']);
const BIN_KEYS = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6'];

export function createInput(canvas, onPointer) {
  let actions = 0;
  let binPressed = -1;

  window.addEventListener('keydown', (event) => {
    if (CONFIRM.has(event.code)) {
      if (!event.repeat) actions |= ACTION_CONFIRM;
    } else if (PAUSE.has(event.code)) {
      if (!event.repeat) actions |= ACTION_PAUSE;
    } else if (TRASH.has(event.code)) {
      if (!event.repeat) actions |= ACTION_TRASH;
    } else if (BIN_KEYS.includes(event.code)) {
      if (!event.repeat) binPressed = BIN_KEYS.indexOf(event.code);
    } else {
      return;
    }
    event.preventDefault();
  });

  canvas.addEventListener('pointerdown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = 1280 / rect.width;
    const scaleY = 720 / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    onPointer(x, y);
  });

  return {
    /** Satu-shot sejak panggilan terakhir, sebagai flag ACTION_*. */
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
    /** Indeks rak bahan yang tombol angkanya ditekan sejak panggilan terakhir, atau -1. */
    takeBin() {
      const taken = binPressed;
      binPressed = -1;
      return taken;
    },
  };
}
