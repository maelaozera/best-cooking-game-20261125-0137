// Dapur Kilat — entri best-cooking-game-20261125-0137 (Node 22, pustaka standar saja).
// Permainan ini adalah game/ di sebelah file ini: berkas statis biasa yang dimuat
// desktop browser secara offline (game/index.html beserta modul-modul ES-nya,
// tanpa pustaka luar dan tanpa permintaan jaringan). Program ini menyerahkannya:
// menyalin game/ dan screenshots/ ke /output lalu menulis /output/dossier.json,
// ringkasan yang dibaca juri, dengan pustaka make.fun yang divendor.
//
// Mainkan secara lokal dengan `node serve.ts`, lalu buka http://localhost:8080.
// Di luar wadah grader, MAKEFUN_OUTPUT_DIR menggantikan /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// Batas-batas scorer (reference/gate.json): hanya text_max_bytes yang membentuk
// byte dossier; sisanya menolak entri yang juga ditolak scorer (lebih dari 4
// screenshot atau satu di atas 256 KiB; lebih dari 993 berkas di game/ atau 48 MiB
// berkas game, atau path di bawah game/ di atas 1000 byte: game/ dihitung di
// samping batas 1000 entri /output sendiri, bersama screenshots/ dan dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
