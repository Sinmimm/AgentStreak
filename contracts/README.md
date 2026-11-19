# AgentStreak

Check-in harian untuk pemegang **Agent ID** (SPACE ID, ERC721 non-transferable)
dengan **soulbound streak-badge** (ERC721 non-transferable). Dibangun untuk
**Binance Agent ID Hackathon** — submit sampai **9 Des 2026 15:00 WIB**.

- Chain: **BNB Chain (chain 56)**
- Kontrak Agent ID: `0x60b9262456de011f7d15a54cdd8c48baaa8b022f`
- Koleksi: **AgentStreak** (`ASTRK`)
- Status: **belum di-deploy** — artefak deploy ada di [`DEPLOY.md`](DEPLOY.md).
  TIDAK ADA transaksi on-chain yang dikirim selama pengembangan ini.

## Cara kerja

1. Pengguna yang memegang ≥ 1 Agent ID memanggil `checkIn()` — maksimal
   **1x per hari UTC** (`day = block.timestamp / 86400`).
2. Bila check-in kemarin (`lastCheckInDay == day - 1`), streak naik +1;
   bila ada hari bolong, streak reset ke 1. `totalCheckIns` selalu +1.
3. Check-in pertama me-mint **satu badge ERC721** (tokenId auto-increment
   mulai 1) ke caller. Badge kedua dan seterusnya TIDAK pernah di-mint.
4. Badge bersifat **soulbound**: `transferFrom` / `safeTransferFrom` /
   `approve` / `setApprovalForAll` semuanya revert `Soulbound()`.
5. `tokenURI(tokenId)` mengembalikan metadata JSON base64 **sepenuhnya
   on-chain**, dengan SVG yang menampilkan nomor badge, streak saat ini,
   dan total check-ins. Tidak ada baseURI eksternal.

## Daftar fungsi

### Tulis

| Fungsi | Keterangan |
|---|---|
| `checkIn()` | Check-in harian. Revert `NotAgentIDHolder` bila caller tidak pegang Agent ID; revert `AlreadyCheckedInToday` bila sudah check-in hari ini. Emit `CheckIn(user, day, streak, totalCheckIns)`. |

### Baca

| Fungsi | Keterangan |
|---|---|
| `streakOf(address)` | Streak berurutan saat ini (0 bila belum pernah). |
| `lastCheckInDay(address)` | Nomor hari UTC check-in terakhir (0 bila belum pernah). |
| `totalCheckIns(address)` | Jumlah total check-in. |
| `badgeOf(address)` | tokenId badge (0 bila belum pernah check-in). |
| `canCheckInToday(address)` | `true` bila pegang Agent ID dan belum check-in hari ini. |
| `totalUsers()` | Jumlah pengguna berbeda yang pernah check-in. |
| `currentDay()` | Nomor hari UTC saat ini. |
| `nextCheckInIn(address)` | Detik sampai bisa check-in lagi; 0 bila time-gate terbuka (hanya mengukur gate waktu, bukan kepemilikan Agent ID). |
| `tokenURI(uint256)` | Metadata JSON base64 + SVG on-chain. Revert `ERC721NonexistentToken` bila token tidak ada. |
| `agentId()` | Alamat kontrak Agent ID (immutable). |
| `SECONDS_PER_DAY()` | 86400. |
| `name()` / `symbol()` | `AgentStreak` / `ASTRK`. |
| `balanceOf` / `ownerOf` / `supportsInterface` | Standar ERC721 (OpenZeppelin v5.4.0). |

### Event & error

- Event: `CheckIn(address indexed user, uint256 day, uint256 streak, uint256 totalCheckIns)`
  (+ event standar ERC721 `Transfer` / `Approval` / `ApprovalForAll`,
  yang dalam praktik hanya `Transfer` saat mint — approval tidak pernah terjadi).
- Custom error: `NotAgentIDHolder`, `AlreadyCheckedInToday`, `Soulbound`,
  `ZeroAgentIDAddress` (+ error standar ERC721 OZ).

## Owner Permissions: TIDAK ADA — kontrak immutable, tidak ada owner, tidak ada fungsi admin

Kontrak ini **sepenuhnya immutable**:

- **Tidak ada owner** — tidak ada `Ownable`, tidak ada alamat admin apa pun.
- **Tidak ada fungsi admin** — tidak ada setter, tidak ada pause, tidak ada
  upgrade, tidak ada `onlyOwner`.
- **Tidak ada fee** — `checkIn()` gratis (selain gas); tidak ada pungutan apa pun.
- **Tidak ada withdraw** — kontrak tidak payable, tidak punya `receive` /
  `fallback`, dan **tidak pernah memegang dana user**; tidak ada fungsi yang
  memindahkan BNB / token keluar.
- **Tidak ada janji return** — badge tidak menjanjikan hadiah, yield, atau
  nilai finansial apa pun; ini murni bukti partisipasi (proof-of-streak).
- **Tidak ada transfer otomatis / approval unlimited** — kontrak tidak pernah
  memanggil `transfer`, `approve`, atau `setApprovalForAll` atas nama siapa pun.
- Satu-satunya nilai yang ditetapkan saat deploy (dan tidak bisa diubah) adalah
  alamat kontrak Agent ID, lewat constructor — lihat [`DEPLOY.md`](DEPLOY.md).
- Setelah deploy, **tidak ada satu pun state yang bisa diubah kecuali lewat
  `checkIn()` oleh pemegang Agent ID itu sendiri** (streak / total / badge
  miliknya).

## Keamanan

- **Audit statis (Slither 0.11.6, 18 Nov 2026)** — 38 temuan total, **0 High /
  0 Medium di file `AgentStreak.sol`**. Sisa temuan di file ini: 3 Low
  `timestamp` (penggunaan `block.timestamp` adalah inti spesifikasi hari UTC —
  tidak bisa dihindari, diterima secara sadar) + 1 Informational `pragma`
  (rentang pragma library OpenZeppelin). 1 High (`incorrect-exp`) + 10 Medium
  (`divide-before-multiply`) ada **di dalam library OpenZeppelin v5.4.0**
  (`Math.mulDiv` / `Base64`) — keduanya false positive yang sudah dikenal
  pada kode OZ yang diaudit (`^ 2` adalah XOR yang disengaja pada invers
  modular Newton-Raphson, bukan eksponensiasi; urutan bagi-dulu adalah
  preservasi presisi yang disengaja). 4 temuan Medium `incorrect-equality`
  di file ini sudah **diperbaiki** (ditulis ulang dengan `<` / `>=` yang
  semantiknya identik — dibuktikan 27/27 test tetap lolos). Laporan lengkap:
  `slither-report.txt` / `slither-report.json`.
- **Keputusan yang disengaja (terdokumentasi di kode):**
  - `_mint` (bukan `_safeMint`): penerima selalu `msg.sender` yang secara
    eksplisit memanggil `checkIn()`; `_safeMint` akan revert untuk
    smart-contract wallet tanpa `onERC721Received` dan memblokir check-in
    yang sah. Badge tidak mungkin nyasar — hanya pernah di-mint ke caller.
  - Perbandingan hari memakai `>=` / `<` (bukan `==`): selain menghilangkan
    temuan Slither, ini juga fail-closed bila timestamp blok bergerak mundur
    melewati tengah malam.
- **Test: 27/27 PASS** (`forge test`) — gate Agent ID, 1x/hari, streak naik /
  reset, badge sekali, transfer & approve revert, tokenURI valid, semua view.
  Lihat `test/AgentStreak.t.sol` dan `test/Gas.t.sol` (harness ukur gas +
  log tokenURI).
- **Validasi end-to-end lokal (anvil, 18 Nov 2026):** init code persis dari
  `artifacts/AgentStreak.initcode.txt` di-deploy ke anvil lokal; `agentId()`,
  `checkIn()` (gas 192.306), `streakOf`/`badgeOf`/`ownerOf`/`tokenURI`, serta
  revert `Soulbound` dan `AlreadyCheckedInToday` semuanya terverifikasi
  terhadap kontrak yang di-deploy dari bytecode final. (Anvil lokal saja —
  TIDAK ADA tx ke BNB Chain.)
- **Validasi tokenURI:** decode base64 → JSON valid (`name`, `description`,
  `image`, `attributes` Streak / Total Check-Ins / Badge) → SVG valid XML
  yang menampilkan angka streak dan total check-ins.

## Gas (diukur, build final)

| Operasi | Gas | Biaya @ 0,05 gwei* | Biaya @ 0,1 gwei |
|---|---|---|---|
| Deploy (tx, incl. 21.000 intrinsic) | ~1.830.601–1.873.665 | ~0,0000915–0,0000937 BNB | ~0,000183–0,000187 BNB |
| `checkIn()` pertama (mint badge) | 197.416 | ~0,00000987 BNB | ~0,00001974 BNB |
| `checkIn()` berikutnya | 51.819 | ~0,00000259 BNB | ~0,00000518 BNB |

\* Harga gas BSC live 0,05 gwei (`eth_gasPrice` = 50.000.000 wei, dicek
18 Nov 2026 ~21:30 WIB di `bsc-dataseed.binance.org` dan
`bsc-dataseed1.defibit.io` — keduanya sama). Ukuran runtime code 7.770 byte
(< batas 24.576 byte). Rekomendasi gas limit deploy: **2.000.000**.

## Build & test

```shell
export PATH="$HOME/.foundry/bin:$PATH"
forge build   # solc 0.8.30, optimizer on, runs 200, evm cancun
forge test    # 27/27 PASS
```

Dependensi: **OpenZeppelin Contracts v5.4.0** (`lib/openzeppelin-contracts`,
via `forge install`, tag `v5.4.0`) + **forge-std** — keduanya terinstal
dari GitHub saat setup (network mengizinkan). `forge` 1.9.0, solc 0.8.30
(dari cache `~/.svm`).

Catatan build: `tokenURI` dipecah jadi potongan `string.concat` kecil karena
satu `abi.encodePacked` dengan banyak argumen membuat kompilasi legacy
codegen gagal "stack too deep" (bukan bug logika — via-IR juga lolos, tapi
build standar tanpa via-IR dipilih agar verifikasi BscScan sederhana).

## Struktur file

```text
contracts/
├── README.md                          # file ini
├── DEPLOY.md                          # langkah deploy manual + ABI + bytecode + init code
├── foundry.toml                       # solc 0.8.30, optimizer 200, evm cancun
├── src/
│   └── AgentStreak.sol                # kontrak (satu-satunya)
├── test/
│   ├── AgentStreak.t.sol              # 26 test fungsional + MockAgentID
│   └── Gas.t.sol                      # harness ukur gas + log tokenURI
├── flattened/
│   └── AgentStreak.flattened.sol      # flattened source untuk verifikasi BscScan
├── artifacts/
│   ├── AgentStreak.abi.json           # ABI JSON
│   ├── AgentStreak.bytecode.txt       # creation code (0x...)
│   ├── AgentStreak.deployedBytecode.txt
│   ├── AgentStreak.initcode.txt       # creation code + constructor arg (siap kirim)
│   └── AgentStreak.constructorArgs.txt
├── slither-report.txt / .json         # laporan Slither final
├── lib/
│   ├── forge-std/
│   └── openzeppelin-contracts/        # v5.4.0
└── out/ cache/                        # artefak build (di-regenerate oleh forge build)
```

## Blocker

Tidak ada blocker. Semua langkah selesai lokal tanpa deploy dan tanpa
private key / seed phrase apa pun.
