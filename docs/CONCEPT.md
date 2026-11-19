# AgentStreak — Konsep dApp Agent ID Hackathon (TERKUNCI 18 Nov 2026 21:25 WIB)

## Proyek
- **Nama:** AgentStreak
- **Satu kalimat:** Daily check-in untuk pemegang Agent ID — bangun streak on-chain dan dapatkan soulbound badge.
- **Kontrak:** AgentStreak.sol (ERC721 soulbound "ASTRK"), BSC chain 56.
- **Website:** frontend statis (index.html + app.js + style.css), akan dipublikasikan sebagai halaman web publik.
- **Reward receiving address:** 0x634f2cB9bbE400859d6372094eD656Ae65D5e2f6 (mallizyyy.ai)

## Cara kerja
1. Pengguna connect wallet → dApp cek balanceOf di kontrak Agent ID 0x60b9262456de011f7d15a54cdd8c48baaa8b022f (> 0 = pemegang).
2. `checkIn()` 1x per hari UTC (gratis, hanya gas). Streak naik bila hari berurutan, reset ke 1 bila bolong.
3. Check-in pertama mint soulbound badge (tidak bisa ditransfer, tidak bisa di-approve). Metadata on-chain (SVG menampilkan streak).
4. Leaderboard Top Streaks dibaca dari event `CheckIn` via eth_getLogs.

## Penilaian vs rubrik juri (100 poin)
| Dimensi (bobot) | Nilai diri | Alasan |
|---|---|---|
| Kedalaman integrasi Agent ID (30%) | Kuat | Agent ID adalah gerbang inti: tanpa Agent ID, checkIn() revert. Badge terikat pada identitas Agent ID. |
| Practicality & feasibility (25%) | Kuat | Kebutuhan nyata: pemegang Agent ID butuh alasan harian memakai ID-nya. Mekanik streak terbukti. Gratis + gas saja. |
| Product completion (25%) | Kuat | Kontrak sederhana + frontend lengkap = selesai penuh dalam hitungan hari, bukan janji. |
| Inovasi (20%) | Sedang | Streak badge sebagai lapisan proof-of-activity on-chain yang composable untuk agen; bukan sekadar check-in biasa. |

## Kandidat yang ditolak
- **Free-mint claim board:** butuh pipeline kurasi konten, Agent ID kurang sentral, lebih banyak moving parts.
- **Guestbook / shout board on-chain:** utilitas rendah, rawan spam, practicality lemah.
- **Raffle / lotre:** janji hadiah/return = risiko red line. Ditolak.

## Rencana 30 interaksi Agent ID (syarat Innovation Award)
- Postingan X user (jalur Community Promotion sekaligus mempromosikan dApp) + post Binance Square.
- Komunitas free-mint hunter (Tina radar dkk.): interaksi gratis, gas ~$0,01.
- Mekanik harian berulang: 30 alamat × check-in beberapa hari = jumlah tx tinggi (membantu juga Project Awards yang menghitung jumlah tx).
- Catatan jujur: 30 alamat adalah bagian tersulit; tanpa promosi aktif dari user, tidak tercapai sendiri.

## Fakta kunci (terverifikasi 18 Nov 2026 ~21:2x WIB)
- Agent ID wallet: claimed=true, mallizyyy.ai; balanceOf Agent ID = 1.
- Saldo wallet: BNB 0,001472281234123052 (~$0,87), USDT 21,09981047243622421.
- Penurunan BNB 0,0235 → 0,00147 BUKAN kehilangan: swap 20:46 WIB (tx 0x6ca6e36871ce16fb8bc46194c5d3968c89c392dc71fbe650712bf2d3435608f3) — 0,02244 BNB → 381.272.751,57 AIC. AIC kini ~$19,99.
- **BLOCKER DEPLOY (definitif):** baw v1.12.0 TIDAK BISA deploy kontrak. `baw contract-call preview` tanpa `--to` mengembalikan `SERVICE_ERROR: "to is required for EVM contract-call"`. Tidak ada subcommand deploy di baw. Jalur lain (forge+key, minta key ke user) DILARANG oleh tugas — laporkan ke parent, kerjakan semua yang bisa tanpa deploy.
- **Form submit proyek TIDAK DITEMUKAN:** pengumuman + Square post tidak memuat URL form submit proyek (hanya survei Community Promotion di app.binance.com, target link tidak terlihat di text fetch). Perlu dicari via live browser oleh parent.
- **Anggaran gas deploy:** TERKOREKSI — BNB 0,00147 MENCUKUPI. Gas deploy terukur ~1,83 jt gas ≈ 0,00009 BNB (@0,05 gwei); checkIn pertama ~0,00001 BNB. Tidak perlu swap tambahan untuk deploy + uji.

## Status build (21:25 WIB)
- Builder kontrak: jalan (Foundry, test, gas report, artefak BscScan).
- Builder frontend: jalan (statis, tanpa build step).
- Berikutnya: satukan hasil → uji lokal → publikasikan frontend → paket submit (TANPA submit form) → lapor parent.
