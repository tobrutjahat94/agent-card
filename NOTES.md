# AgentCard — build log

## 2026-11-18 ~19:07 WIB — Task received
- Binance Agent ID Hackathon, 60,000 USDC. Submission 18 Nov 08:00 UTC – 9 Dec 08:00 UTC.
- Initial concept: "AgentStreak" daily check-in dApp. Workspace `~/workspace/agent-id-hackathon/`.

## 2026-11-18 ~19:08 — Announcement verified (live read)
- Project Awards 29,000 USDC (Pioneer: on-chain ranking, top 10) + Innovation Award 29,000 USDC (judge panel, 100 pts: depth 30%, practicality 25%, completion 25%, innovation 20%) + Promotion 2,000 USDC (20 X-post winners, #BinanceWalletHackathon + #AgenticWallet, submit link via app.binance.com survey).
- Innovation eligibility: product live + ≥30 Agent ID addresses interacting during submission.
- Agent ID contract `0x60b9262456de011f7d15a54cdd8c48baaa8b022f`, SPACE ID, ERC-721 non-transferable; holder check = `balanceOf(address) > 0`. Code exists on mainnet (eth_getCode). Claim only in Binance App.
- No project submission form link in the announcement text; "No registration needed". Promotion survey is the only linked form.
- Environment: Node v24.22.1, npm 10.9.4, gh logged in as tobrutjahat94. Hardhat 3 + toolbox 7 incompatible (shim warning) → switched to Hardhat 2.28.0 + toolbox 6.1.2 (hh2 tag).

## 2026-11-18 ~19:10 — First build: AgentStreak (later replaced)
- `contracts/AgentStreak.sol`: checkIn() once per UTC day, Agent ID gate, streaks. `contracts/mocks/MockAgentID.sol`. 8/8 tests passed. Deploy scripts written. Throwaway testnet-only wallet generated: `0x35ba4f36d3A1CDc99D9dAFc9d4aA9FE11234a364` (key in `deployments/testnet-deployer.json`, 600, git-ignored).
- Faucet attempts via curl failed: official faucet page 301; Chainstack claim endpoint returns SPA HTML (needs login); QuickNode/triangle unreachable or down. Wallet balance 0 tBNB → testnet deploy blocked on funding.

## 2026-11-18 ~19:11 — CORRECTION: time + pivot (user steer)
- **Time correction:** 08:00 UTC = **15:00 WIB**, not 16:00. Submission: **18 Nov 15:00 – 9 Dec 15:00 WIB**. Fixed in all docs.
- **Pivot:** Agentic Wallet does not sign arbitrary txs by default; custom calls need Developer Mode (manual, expiring, per-op confirmation, separate daily limit). Daily check-in unrealistic; static "connect wallet" frontend likely unusable for Agent ID holders. Pivot to **one-shot interaction** + deeper-than-balanceOf integration (identity as data).
- Deleted AgentStreak.sol + its tests.

## 2026-11-18 ~19:12 — Agent ID interface check (on-chain, verified)
- Bytecode selectors (8,756 bytes runtime): balanceOf, ownerOf, tokenURI, name, symbol, supportsInterface, approve, transferFrom, safeTransferFrom, setApprovalForAll, getApproved, isApprovedForAll present. **Absent:** tokenOfOwnerByIndex (2f745c59), tokenByIndex, totalSupply — no ERC721Enumerable.
- Probes: `name()` = "SPACE ID Agent ID", `symbol()` = "AI", `supportsInterface(0x780e9d63)` (Enumerable) **reverts**, `balanceOf(bot wallet 0x6B96…0728)` = 0 (bot wallet holds no Agent ID).
- BscScan API via curl: Cloudflare-gated (301/landing page). BscScan contract page fetch: HTTP 403, not retried per instruction. ABI conclusion rests on selector extraction + on-chain probes.
- `baw` skill docs confirm contract-call path: `baw contract-call preview --binanceChainId 56 --from … --to … --value 0 --inputData …` → `execute --requestId …`; Developer Mode enable path (App → Agentic Wallet → Settings → Developer Mode → Risk Warning → approve signature), 7-day validity, balance cap (351804), daily limit (351807), risk-block (351803), expired (351801/351802).
- eth_getLogs from this VM is unreliable (dataseed returns empty / rate-limits -32005; publicnode 403; llamarpc closed; ankr error). TokenId discovery must rely on BscScan "ERC-721 Token Txns" as primary; log scanning is best-effort only.

## 2026-11-18 ~19:14 — Second steer: 5 checks from user
1. Testnet cannot prove the Agentic Wallet path (Agentic Wallet docs list mainnet chains only; Agent ID claimable only via App). Testnet = contract logic only. Mainnet proof needs a minimal mainnet deploy + one holder test — **prepared, NOT run; deploy is executed directly by the wallet owner** (no chat approval involved).
2. ABI check done (above). No enumerable/resolver → identity-as-data = caller address + verified tokenId; **no name forced, no name stored**.
3. **No name → wallet lookup** anywhere (contract, UI, docs). Directory lists address + tokenId only.
4. Developer Mode risk check: new unknown contracts can be blocked (351803). The mainnet holder test doubles as a risk-check test — noted as an explicit test objective.
5. Agent documentation drafted (`docs/AGENT-GUIDE.md`) — complete step-by-step for the 30 holders, for user review.

## 2026-11-18 ~19:15 — AgentCard build (pivot)
- `contracts/AgentCard.sol`: `register(tokenId, endpoint, message)` — balanceOf gate + ownerOf(tokenId)==msg.sender binding, one card per address/token, endpoint ≤200B, message ≤280B, `CardRegistered` event. No owner, no admin, no pause, no mint, no funds. Agent ID address immutable constructor param.
- `contracts/mocks/MockAgentID.sol`: rewritten (balanceOf, ownerOf, tokenURI, tokenOfOwnerByIndex for testnet convenience, mint returning sequential tokenId). TEST ONLY.
- Tests: 11/11 passing (`npx hardhat test`). Compile 0.8.28 OK.
- Deploy scripts rewritten for AgentCard. Local end-to-end proof: `npx hardhat run scripts/deploy-testnet.js` on the in-process network — mock deployed, minted tokenId 1, registered a test card, read it back (tx `0xf359…88b7c`, block 4). Generated `deployments/bscTestnet.json` from the local run was deleted (not a real testnet deploy).
- Helper scripts: `scripts/find-token-id.js` (Transfer-event scan, retry+delay; VM RPC rate-limits it — documented), `scripts/build-register-calldata.js` (builds register() calldata + exact baw preview/execute commands + staticCall dry-run).
- Frontend: `docs/index.html` + `docs/app.js` (ethers v6 CDN) — connect, Agent ID status, tokenId auto-detect (best-effort) + manual entry, register, directory from CardRegistered events, own-name display for the connected wallet only. Contract addresses are placeholders until deploy.
- Docs: `README.md` (incl. Owner permissions section), `docs/AGENT-GUIDE.md`, `SUBMISSION.md`.
- Repo: `tobrutjahat94/agent-card` (renamed from agent-streak to match the pivot) + GitHub Pages from `docs/`.

## Pending (user steps)
1. Fund throwaway testnet deployer `0x35ba4f36d3A1CDc99D9dAFc9d4aA9FE11234a364` with ~0.05 tBNB (official faucet in a browser) → then testnet deploy + BscScan verification can run.
2. **Mainnet deploy — executed directly by the wallet owner** (see README "Deploy preparation"): new dedicated deployer wallet, 0.02 BNB gas funding (deploy ~0.00131 BNB at 1 gwei, register ~0.00020 BNB — measured), run `scripts/deploy-mainnet.js`, verify source on BscScan immediately. No chat approval is involved; the bot never deploys.
3. Holder test after deploy (one Agent ID holder registers via Developer Mode; objectives: call works + passes risk check 351803 + card recorded). Steps in `docs/AGENT-GUIDE.md`.
4. Review `docs/AGENT-GUIDE.md` draft (pasted in full in the builder's report — user has no access to builder/state files).
5. Invite 30 Agent ID holders to register during the submission period (needed for Innovation Award eligibility + Pioneer ranking).
6. Submit via "Submit Project Now" on the official announcement page (fill `SUBMISSION.md`, incl. reward receiving address). Deadline 9 Dec 15:00 WIB.
7. Optional: X post for the Promotion Award (#BinanceWalletHackathon + #AgenticWallet, submit link via app.binance.com survey).

## 2026-11-18 ~19:30–19:45 WIB — Revisi pasca-review user (11 poin, semua dikerjakan)

User review 19:30 WIB: kontrak sehat, repo + README cocok, tapi user belum
compile/test dan belum lihat scripts/ maupun docs/app.js. Semua poin di bawah
dikerjakan di repo yang sama, lalu push (lihat commit di akhir entri).

1. **Opsi "normal wallet" dihapus.** AGENT-GUIDE (Option A), SUBMISSION.md,
   dan README tidak lagi menawarkan register dari website lewat normal wallet.
   Keputusan konsisten: **website = direktori read-only saja**, tidak pernah
   minta connect wallet / sign. Register hanya lewat agent pemegang di
   Binance App (Developer Mode).
2. **Guide non-teknis + prompt agent.** AGENT-GUIDE.md ditulis ulang:
   langkah pemegang = aktifkan Developer Mode + set Abnormal Handling +
   cari tokenId di BscScan + paste satu prompt ke agent + konfirmasi di App.
   File baru `docs/HOLDER-AGENT-PROMPT.md`: satu blok prompt tinggal paste,
   agent-nya yang install skill, cek settings, bangun calldata, preview,
   dan execute setelah konfirmasi eksplisit pemegang.
3. **Abnormal Transaction Handling.** Masuk Step 1 guide + troubleshooting
   (`351803`): set ke **Need Confirmation**, bukan Auto Reject — kontrak
   baru yang belum dikenal bisa dianggap abnormal oleh risk engine.
   Sumber: Flap docs (https://docs.flap.sh/en/flap/skills/using-with-binance-agentic-wallet
   — halaman ditandai **archived** oleh Flap, bisa out of date) +
   Binance Blog "Agentic Wallet Controls"
   (https://www.binance.com/en-NG/blog/tech/7276731523787720812 — risk score
   ≥4 dikirim ke App untuk konfirmasi atau auto-reject tergantung setting
   abnormal transaction). Label persis di App diminta dikonfirmasi saat tes.
4. **Verifikasi BscScan.** README + hardhat.config.js diperbaiki: syarat =
   halaman kontrak BscScan menunjukkan **"Source Code Verified"**;
   Sourcify saja TIDAK cukup; `hardhat verify` butuh BSCSCAN_API_KEY
   (gratis, dari akun BscScan); kalau gagal, manual "Verify & Publish".
   Undang pemegang lain HANYA setelah verifikasi beres. Tabel status diupdate.
5. **Private key inline dihapus.** Semua contoh `KEY=... command` dihapus
   dari README/docs. Pengganti: file `.env` (git-ignored) atau prompt
   `read -s`, lalu `unset` + `history -c`. `scripts/deploy-mainnet.js`
   diperbarui + cek pasca-deploy `agentId()` harus persis
   `0x60b9262456de011f7d15a54cdd8c48baaa8b022f` (dan
   `scripts/build-register-calldata.js` menolak deploy dengan agentId lain).
6. **Audit website.** `docs/app.js` + `docs/index.html` ditulis ulang jadi
   direktori read-only: tanpa connect/register/auto-detect; rendering hanya
   DOM + `textContent` (nol `innerHTML` di luar komentar); link hanya bila
   endpoint diawali `https://`, dengan `rel="noopener noreferrer"`.
   Temuan audit: app.js lama pakai `innerHTML` untuk tabel direktori +
   status (endpoint/message di-escape tapi scheme tidak divalidasi, jadi
   `javascript:` bisa jadi href; `rel` cuma `noopener`). Semua diperbaiki.
7. **endpointOf.** `function endpointOf(address) view returns (string)`
   ditambah ke AgentCard.sol + 2 test baru. Gas deploy naik 1.307.491 →
   1.411.386 (final, termasuk guard poin 12).
8. **Peer discovery.** Tiga baris contoh (`endpointOf` / `getCard` / fetch
   endpoint) masuk README + AGENT-GUIDE + SUBMISSION.md. Target utama =
   Innovation Award; Pioneer sekunder/sulit (one-shot ≈ 1 tx/holder).
9. **Kartu pertama.** Ditulis sebagai placeholder yang diisi user sendiri
   (Sanusinakamoto.ai, endpoint + message pilihan dia, permanen). Tidak ada
   endpoint/message yang diisi bot.
10. **Sumber Developer Mode per fakta.** Semua fakta di guide diberi sumber
    di tempat: 7 hari + extends + langkah enable + `baw wallet settings` +
    351802/351804/351805 (Binance skills-hub `external-sign.md`); limit
    1.000/5.000/10.000/50.000 + balance cap 10.000 USDT + auto-disable 7
    hari + risk score ≥4 (Binance Blog "Agentic Wallet Controls"); 351801 +
    351807 (Binance skills-hub `agent-id-exclusive-token-launches.md`);
    351803 (external-sign.md); Developer Mode = custom contract calls +
    risiko (Binance FAQ Agentic Wallet). Tidak ada halaman resmi standalone
    "Developer Mode" yang bisa dibuka — sumber terdekat adalah Blog/FAQ/
    skills-hub resmi Binance di atas. Tidak ada fakta yang ditandai
    UNVERIFIED karena semuanya bersumber; yang ditandai hati-hati adalah
    label persis "Abnormal Transaction Handling" di App (sumber Flap,
    archived) — diminta konfirmasi di App saat tes.
11. **Klaim test + 4 exit-1 lama.** `npx hardhat test` dijalankan ulang
    sendiri di sesi ini: **14/14 passing, exit 0** (lihat NOTES bawah).
    Empat exec exit-1 builder + satu browser_open gagal ditelusuri lewat
    `muse.db` (child `8f4938e4-…`): (a) probe eth_getCode #1 gagal —
    RPC tanpa field `result` (KeyError); (b) probe eth_getCode #2 gagal —
    RPC error -32000 `missing trie node`; (c) BscScan API getabi/
    getsourcecode — Cloudflare 301 HTML, JSON decode gagal; (d) BscScan
    halaman kontrak — HTTP 403; (e) probe Transfer-events — 0 event dalam
    3.000 blok terakhir, IndexError. Semuanya probe riset/ABI, BUKAN
    compile/test — tidak satu pun menyentuh `npx hardhat test`. Klaim
    test didukung run baru 14/14 di sesi ini, bukan kata builder.
12. **Perubahan kontrak batch terakhir (tambahan, sebelum push final).**
    Selain `endpointOf`, ditambahkan guard `require(endpoint non-empty)`:
    kartu permanen dengan endpoint kosong = kartu tidak berguna selamanya.
    Message boleh kosong (endpoint adalah bagian fungsional). 1 test baru.
    Dipertimbangkan dan TIDAK dimasukkan: validasi `https://` on-chain
    (agen bisa pakai endpoint non-HTTPS yang sah, mis. wss://; kebijakan
    https hanya di UI + script calldata), helper `messageOf`/`tokenIdOf`
    (sudah tercakup `getCard`), dan enumerasi on-chain (tidak mungkin
    tanpa mengubah desain; direktori dibaca dari event). Kontrak tetap
    minimal: tidak ada dana/admin/pause/mint.

**Tambahan 19:33 WIB — alur peran + checklist kampanye aman** (commit
`414ca65`, setelah commit revisi `2eb1a1c`): wording di AGENT-GUIDE /
HOLDER-AGENT-PROMPT / SUBMISSION / README diubah jadi "dicek Claude,
diputuskan dan diposting manusia" — draf boleh dicek Claude, tapi keputusan
+ eksekusi posting adalah manusia pemilik akun, bukan bot. Checklist
kampanye aman masuk ke keempat file itu (bukan cuma laporan): nyatakan
entri hackathon + pembuat + repo + kontrak verified BscScan + README owner
permissions; jelaskan persis apa yang di-sign (satu `register()`, 0 BNB,
cuma gas, tanpa approval, tidak bisa dibatalkan; kartu permanen + publik);
jangan minta seed phrase / API secret / pairing code / QR login di mana
pun termasuk DM (red line); jangan janji imbalan/return, larangan bahasa
"passive income" / "automatic money-making" berlaku untuk komunikasi
proyek; jangan bagi hadiah supaya orang register (risiko diskualifikasi);
jangan pakai "Binance"/"BNB" di nama akun/proyek/domain (menyebut "Binance
Agent ID Hackathon" untuk menjelaskan acara boleh); hashtag
#BinanceWalletHackathon + #AgenticWallet boleh, tapi Promotion Award
2.000 USDC adalah buat postingan komunitas yang menilai proyek lain —
jangan andalkan untuk narik holder. Kumpul 29 holder: Discord/Telegram
resmi Binance Wallet dan BNB Chain adalah tempat paling masuk akal; baca
aturan tiap grup soal promosi dulu sebelum posting; tidak diklaim ada
grup Agent ID khusus (tidak terverifikasi).
**HEAD akhir: `414ca655d0869a081ecfa39c21963669c954d3e9`.** GitHub Pages
terverifikasi HTTP 200 (index, AGENT-GUIDE.md, HOLDER-AGENT-PROMPT.md;
file prompt sempat 404 ~2 menit karena lag rebuild Pages, lalu 200).

## 2026-11-18 ~19:17 — CORRECTION: deploy approval is NOT from chat (user steer)
- Persetujuan/eksekusi deploy mainnet BUKAN sesuatu yang bisa diberikan lewat chat — itu keputusan dan tindakan langsung manusia pemilik wallet. Semua framing "menunggu persetujuan user (chat)" dihapus dari README, SUBMISSION.md, AGENT-GUIDE.md, NOTES.md, dan header `scripts/deploy-mainnet.js`; diganti "deploy dieksekusi langsung oleh manusia pemilik wallet, berdasarkan materi yang disiapkan di sini".
- Syarat persiapan deploy masuk README ("Deploy preparation"): (1) wallet deployer khusus baru, saldo BNB secukupnya buat gas saja, BUKAN wallet utama; private key TIDAK PERNAH masuk chat/repo/state file. (2) Verifikasi source di BscScan langsung setelah deploy (syarat eligibility). (3) Owner permissions di README — kontrak tidak punya fungsi owner sama sekali (ditulis eksplisit). (4) Jangan ubah kontrak setelah ada interaksi (alamat baru = hitungan mulai nol; testnet dipakai habis-habisan buat logika). (5) SATU KONTRAK SAJA (satu tim satu proyek, cuma alamat yang disubmit yang dihitung).
- Estimasi gas diukur lokal (`scripts/estimate-gas.js`): deploy AgentCard 1,307,491 gas (~0.00131 BNB @1 gwei, ~0.00392 @3 gwei); register 195,038 gas (~0.00020 BNB @1 gwei). Saran funding deployer: 0.02 BNB.
- User TIDAK punya akses ke builder/state file dari chat → laporan builder harus berisi SEMUA materi review ditempel lengkap (kode kontrak, draf dokumentasi agent, materi submit), bukan sekadar path file.

## 2026-11-18 ~20:11 WIB — Revisi luar-kontrak (batch kontrak DIKUNCI)

Review user 20:10 WIB: kontrak final OK (logika konsisten, `endpointOf` +
guard endpoint kosong benar, gas register 195.091 wajar) — **batch kontrak
dikunci, tidak ada perubahan di `contracts/`**. Semua poin di bawah ini di
luar kontrak. Revisi ini TIDAK menahan deploy mainnet: deploy, verifikasi
BscScan, dan kartu pertama bisa jalan paralel. Yang harus menunggu revisi
ini hanya mengundang holder lain + memasang hash pin di prompt.

1. **getLogs di `docs/app.js` (kemungkinan gagal).** `CHUNK = 100000` pada
   RPC publik BSC biasanya kena batas rentang blok (probe builder sendiri
   cuma pakai 3.000 blok — indikasi sama). Perbaikan: (a) tampilkan
   `totalCards()` DULU (satu `eth_call`, tanpa logs) — angkanya muncul
   langsung walau scan log gagal; kalau total 0, `getLogs` tidak dipanggil
   sama sekali; (b) scan log dengan chunk yang mengecil otomatis
   (100000 → 10000 → 3000 → 1000) di semua RPC cadangan
   (bsc-dataseed.binance.org, bsc-dataseed1.defibit.io,
   bsc-dataseed1.ninicoin.io, bsc.publicnode.com; testnet: dua dataseed
   prebsc + bsc-testnet.publicnode.com); (c) kalau semua gagal, tampilkan
   link ke halaman kontrak di BscScan, bukan cuma pesan error. Tiap
   percobaan RPC dibatasi 15 detik agar RPC mati tidak menggantung halaman.
   Probe dari VM builder 20:11 WIB: ketujuh RPC menjawab `eth_blockNumber`,
   tapi `eth_getLogs` ditolak/diputus di semua RPC yang dicoba — bahkan
   rentang 500 blok kena `-32005 limit exceeded` / disconnect (IP VM
   di-rate-limit; catatan lama yang sama ada di NOTES 19:12). Jadi batas
   rentang per-RPC yang persis TIDAK bisa ditetapkan dari VM ini; tangga
   chunk di atas adalah desain defensif sesuai spek user, dan tes
   sesungguhnya adalah mainnet setelah kartu pertama masuk — ditulis
   eksplisit di komentar `app.js` (jangan klaim sudah dites mainnet).
2. **Prompt holder (supply-chain).** `docs/HOLDER-AGENT-PROMPT.md` langkah 4
   ditulis ulang: clone lalu `git checkout v1.0`, verifikasi
   `git rev-parse HEAD` sama dengan hash pin, BACA
   `scripts/build-register-calldata.js` dulu (singkat, read-only — jangan
   jalanin sebelum baca), lalu `npm install` (sebelumnya langkah ini tidak
   ada). Pin = tag `v1.0` + hash lengkap commit berisi script final.
   **Dua commit (bukan satu):** hash commit tidak bisa diketahui sebelum
   commit dibuat, jadi commit #1 berisi semua revisi (script final),
   ditag `v1.0`; commit #2 mengisi hash lengkap commit #1 ke dalam prompt.
   Hash pin ≠ HEAD — itu benar dan disengaja: prompt dibaca dari `main`
   (terbaru), script dijalankan dari checkout `v1.0`; `git diff v1.0 HEAD
   -- scripts/ docs/app.js` harus kosong (diverifikasi saat commit #2).
   Alamat kontrak bukan bagian dari pin: masuk lewat `--to`, jadi deploy
   baru tidak butuh pin baru — tapi kalau `scripts/` berubah lagi, hash
   di prompt HARUS diganti (ditulis di prompt).
3. **Bagian "draft a message inviting other holders" DIHAPUS dari prompt
   holder.** Itu aturan internal, bukan buat holder — membengkakkan
   prompt, membingungkan, dan membocorkan alur kerja ("checked by
   Claude"). Isinya dipindah ke catatan privat di bawah (bagian "Private
   — campaign rules" di entri ini, BUKAN di prompt). Prompt tidak lagi
   menyebut "checked by Claude" / alur internal: baris safety-nya kini
   "You never post anything on my behalf. The decision to post and the
   posting itself are done by me, the human owner of the account."
   AGENT-GUIDE / README / SUBMISSION tetap memakai wording "dicek Claude,
   diputuskan dan diposting manusia" — itu wording yang disetujui user
   19:33 untuk dokumen publik proyek; yang dihapus hanya dari prompt
   (instruksi tempel-ke-agent).
4. **Quoting + byte length.** Prompt + script konsisten pakai kutip
   tunggal: `--endpoint '...' --message '...'` (kutip ganda merusak `$`,
   backtick, `"`). Kalau pesan mengandung kutip tunggal, pakai
   `--messageFile` / `--endpointFile` (baru di script: file dibaca
   verbatim, satu newline akhir di-strip). `scripts/build-register-calldata.js`
   ganti `.length` → `Buffer.byteLength(..., "utf8")` untuk endpoint
   (200 byte) dan message (280 byte), dengan pesan error yang menyebut
   jumlah byte persis. Verifikasi CLI 20:11 WIB (lokal, tanpa network
   untuk penolakan — cek panjang jalan sebelum RPC): pesan 71×😀 (71
   karakter, 284 byte) → `Error: message is 284 bytes, over the
   280-byte contract limit`, exit 1; endpoint `https://example.com/` +
   46×😀 (66 karakter, 204 byte) → `Error: endpoint is 204 bytes, over
   the 200-byte contract limit`, exit 1. Dengan `.length` lama, keduanya
   lolos cek (71 dan 66) lalu revert membingungkan di dry-run. Batas
   inklusif: pesan 70×😀 = 280 byte persis LOLOS validasi (lanjut ke
   cek agentId di node lokal). `--messageFile` berisi
   `It's $100 \`tick\` "quoted" 🎉` lolos validasi; round-trip
   encode/decode calldata (ethers Interface yang sama dengan script)
   membuktikan byte-nya identik (`message match: true`). Quoting shell
   kutip tunggal diverifikasi via argv echo (string diterima literal).
   Batasan jujur: dry-run SUCCEED penuh dengan emoji tidak bisa
   dijalankan lokal — script (by design) menolak deployment yang
   `agentId()`-nya bukan Agent ID resmi, dan kontrak resmi tidak ada di
   localhost; kedua kasus lolos-validasi di atas berhenti di cek agentId
   itu (mock), seperti dirancang. Jalur dry-run sendiri tidak berubah
   dari revisi sebelumnya (sudah dibuktikan end-to-end lokal saat itu),
   dan batas byte kontrak dicakup test suite (200/280 pas lolos, lebih
   revert — `npx hardhat test` 14/14, dijalankan ulang 20:11 WIB).
5. **Endpoint tetap link klikabel (pilihan: teks + tombol "open").**
   `rowElement` di `app.js`: endpoint ditampilkan sebagai teks polos
   (span, wrap), lalu — hanya untuk `https://` — tombol link terpisah
   "open ↗" + label kecil "user-submitted, verify before opening".
   Bukan endpoint-nya sendiri yang jadi link. Diterapkan konsisten di
   `app.js` + `index.html` (paragraf Directory) + kalimat yang sama di
   README ("Website") dan AGENT-GUIDE ("Finding other agents").
6. **`index.html` memuat ethers versi dipin** (sudah benar sebelum
   revisi ini, diverifikasi): `<script
   src="https://cdn.jsdelivr.net/npm/ethers@6.13.2/dist/ethers.umd.min.js">`
   — versi 6.13.2, bukan `latest`.
7. **Push vs snapshot cache user.** Dicek dari sisi server setelah push
   (lihat lampiran commit #2): remote HEAD + README via
   raw.githubusercontent.com — pastikan beda dari snapshot lama user
   (2 commit, README "11 tests", gas lama, "normal wallet" sebagai
   jalur). Catatan: kata "normal wallet" masih muncul di repo, tapi
   hanya sebagai penolakan ("There is no 'register from a normal wallet
   on the website' path", README) dan istilah resmi Binance ("normal
   wallet limits", AGENT-GUIDE) — bukan sebagai jalur register.
8. **Key testnet bocor (dianggap bocor, testnet saja).** `git log --all --
   deployments/testnet-deployer.json` di repo lokal builder: KOSONG
   (dijalankan 20:10 WIB, exit 0, tanpa output). Cek dari CLONE SEGAR
   + `git log --all -p | grep -i "private"` + secret scanning GitHub
   ada di lampiran commit #2.
9. **Developer Mode tetap paling rapuh.** Tidak ada klaim sumber yang
   diubah; ditambahkan catatan "First-test check" di AGENT-GUIDE: saat
   tes holder mainnet pertama, cocokkan tiap label/langkah Step 1
   dengan yang tampil di App dan laporkan perbedaannya agar guide
   diperbaiki dari cek itu, bukan dari ingatan.

### Private — campaign rules (dipindah dari prompt holder, BUKAN untuk holder)

Aturan internal proyek untuk draf yang mengundang holder lain (dulu ada
di `docs/HOLDER-AGENT-PROMPT.md`, dihapus dari sana 20:11 WIB karena
bukan instruksi buat holder):
- Say plainly this is a hackathon entry and who made it: AgentCard by
  tobrutjahat94, repo https://github.com/tobrutjahat94/agent-card,
  contract verified on BscScan, README "Owner permissions" (no owner).
- Explain exactly what is signed: one register() call, value 0 BNB,
  gas only, no approval of any spending, cannot be undone. Card is
  permanent and public.
- Never ask for anything sensitive — seed phrase, API secret, pairing
  code, QR login — anywhere, including by DM. Red line.
- Never promise a reward or a return. Never use "passive income" or
  "automatic money-making" language.
- Never offer prizes or rewards for registering (manipulated
  volume/interaction → disqualification risk).
- Never use "Binance" or "BNB" in an account/project/domain name.
  Saying "Binance Agent ID Hackathon" to explain the event is fine.
  Hashtags #BinanceWalletHackathon + #AgenticWallet may be used.
- Do not present the separate 2,000 USDC Promotion Award (community
  posts reviewing other projects) as a way to attract holders.
- Where to find holders: official Discord or Telegram of Binance
  Wallet and BNB Chain. Read each group's promotion rules first.
  Do not claim a dedicated Agent ID group exists unless verified.
- Role flow: a draft may be checked by Claude, but the decision to
  post and the posting itself are done by the human owner of the
  account — never by a bot.

### Lampiran verifikasi (commit #2 + #3, 20:11–20:18 WIB)

- **Commit #2 `38b294d8cb7d8319d81e1bc497776ad38f34685f`**: prompt diisi
  pin `v1.0` + hash lengkap `bc42cf4da37cbf4f67286765cec1a0d23785387d`.
  `git diff v1.0 HEAD -- scripts/ docs/app.js` KOSONG — script dan
  `app.js` di HEAD identik dengan yang di-tag, jadi pin tetap valid
  walau HEAD sudah maju dua commit. Local HEAD = remote HEAD
  (`38b294d`), tag `v1.0` = `bc42cf4` di remote.
- **Cek kebocoran key dari CLONE SEGAR** (clone remote, HEAD `38b294d`,
  tag `v1.0` ada): `git log --all -- deployments/testnet-deployer.json`
  → KOSONG (file tidak pernah masuk histori di ref mana pun).
  `git log --all -p | grep -i "private"` → 53 baris, semuanya prosa:
  kata "private key" di teks keselamatan ("private key TIDAK PERNAH
  masuk chat/repo/state file", "Never ask me for my seed phrase,
  private key..."), nama env var (`MAINNET_PRIVATE_KEY`,
  `TESTNET_PRIVATE_KEY`), dan placeholder (`<key>`, `<dedicated
  deployer key, never shared>`). Tidak ada nilai kunci.
  `git log --all -p | grep -oE "[0-9a-f]{64}"` → KOSONG (tidak ada
  string 64-hex yang bisa jadi raw private key di seluruh histori).
  GitHub secret scanning API
  (`gh api repos/tobrutjahat94/agent-card/secret-scanning/alerts`) → 0
  alert. Repo: public, secret_scanning enabled, push protection
  enabled. Key testnet yang sempat tampil di output sesi revisi
  sebelumnya tetap dianggap bocor (testnet saja, jangan dipakai ulang)
  — tapi bukti di atas menunjukkan key itu tidak pernah masuk repo.
- **Push vs snapshot cache user (sisi server).** README via
  raw.githubusercontent.com (main, bukan Pages/cache): "14 unit tests"
  (baris 154) + "14/14 passing" (baris 170); gas deploy 1,411,386,
  register 195,091; "normal wallet" 1 kemunculan, baris 11, sebagai
  penolakan ("There is no 'register from a normal wallet on the
  website' path") — bukan jalur register; tidak ada "11 tests", tidak
  ada gas lama 1,307,491 / 195,038. Prompt remote berisi `v1.0` +
  hash lengkap `bc42cf4…`. Jadi versi yang di-push memang beda dari
  snapshot lama yang dilihat user (2 commit, "11 tests", gas lama).
- **GitHub Pages.** HTTP 200 ×3 (index, AGENT-GUIDE.md,
  HOLDER-AGENT-PROMPT.md). Konten sempat menyajikan build lama
  (`CHUNK = 100000`, tanpa pin) — lag rebuild Pages; dicek ulang
  20:18 WIB (~3 menit kemudian): build baru live (hash pin ada di
  prompt, `LOG_CHUNKS` ada di app.js). `index.html` menyajikan ethers
  dipin `6.13.2` di kedua build (tidak berubah).
- **Kontrak/test tidak tersentuh:** `git diff --stat -- contracts/
  test/` kosong di seluruh batch ini; `npx hardhat test` 14/14
  (dijalankan ulang 20:11 WIB). Tidak ada deploy, submit, atau
  signing di sesi ini.
