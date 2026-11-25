# Dapur Kilat — Game Memasak

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounties/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![make.fun · rank](https://make.fun/badge/best-cooking-game-20261125-0137/maelaozera/best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounties/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![make.fun · reward](https://make.fun/badge/best-cooking-game-20261125-0137/maelaozera/best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounties/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

Entri untuk bounty [best-cooking-game-20261125-0137](https://make.fun/bounties/best-cooking-game-20261125-0137) di make.fun: **Dapur Kilat**, game memasak time-management yang berjalan penuh di browser desktop, offline, dengan keyboard dan mouse.

> Daftar make.fun lewat tautan saya: https://make.fun/r/02gvsh14

## Cara bermain

Pesanan masuk ke **papan pesanan** di kiri, masing-masing dengan batas waktu sendiri. Rakit hidangan yang diminta di **piring rakitan**, lalu sajikan sebelum waktunya habis.

- **Klik bahan di rak bawah** (atau tekan tombol **1–6**): roti, keju, dan selada langsung ke piring; **patty** harus dipanggang dulu di panggangan; **tomat** dan **bawang** harus dicincang di talenan (dua kali klik).
- **Klik panggangan** untuk mengambil patty yang sudah matang — dibiarkan terlalu lama, patty gosong dan harus dibuang.
- **Spasi** menyajikan piring. Racikan yang cocok dengan pesanan memberi poin (makin cepat, makin besar) plus bonus combo; racikan yang salah dan pesanan yang kedaluwarsa masing-masing menghabiskan satu nyawa.
- Tiga nyawa habis atau shift 150 detik berakhir, permainan selesai. Setiap 4 hidangan tersaji naik satu level: pesanan datang lebih cepat dan batas waktunya makin pendek.

Menu yang bisa dipesan: **Burger Kilat**, **Salad Segar**, **Sandwich Keju** (level 2), dan **Burger Double** (level 3).

## Menjalankan

```sh
node serve.ts
# buka http://localhost:8080
```

Tidak ada langkah build dan tidak ada permintaan jaringan: `game/` hanya berisi `index.html` dan modul-modul ES yang digambar dengan kanvas 2D.

## Menyerahkan (hand-in)

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` menyalin `game/` dan `screenshots/` ke direktori output lalu menulis `dossier.json` dengan pustaka `vendor/makefun-game.ts`.

## Screenshot

Empat adegan diambil dari kode game yang sama, dijalankan di browser headless lewat `?shot=start|play|serve|end&seed=1` (lihat `shots.json`): layar judul, dapur di tengah kesibukan, piring siap disajikan, dan akhir shift.

## Lisensi

MIT — lihat [LICENSE](LICENSE).
