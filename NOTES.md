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

## 2026-11-18 ~19:17 — CORRECTION: deploy approval is NOT from chat (user steer)
- Persetujuan/eksekusi deploy mainnet BUKAN sesuatu yang bisa diberikan lewat chat — itu keputusan dan tindakan langsung manusia pemilik wallet. Semua framing "menunggu persetujuan user (chat)" dihapus dari README, SUBMISSION.md, AGENT-GUIDE.md, NOTES.md, dan header `scripts/deploy-mainnet.js`; diganti "deploy dieksekusi langsung oleh manusia pemilik wallet, berdasarkan materi yang disiapkan di sini".
- Syarat persiapan deploy masuk README ("Deploy preparation"): (1) wallet deployer khusus baru, saldo BNB secukupnya buat gas saja, BUKAN wallet utama; private key TIDAK PERNAH masuk chat/repo/state file. (2) Verifikasi source di BscScan langsung setelah deploy (syarat eligibility). (3) Owner permissions di README — kontrak tidak punya fungsi owner sama sekali (ditulis eksplisit). (4) Jangan ubah kontrak setelah ada interaksi (alamat baru = hitungan mulai nol; testnet dipakai habis-habisan buat logika). (5) SATU KONTRAK SAJA (satu tim satu proyek, cuma alamat yang disubmit yang dihitung).
- Estimasi gas diukur lokal (`scripts/estimate-gas.js`): deploy AgentCard 1,307,491 gas (~0.00131 BNB @1 gwei, ~0.00392 @3 gwei); register 195,038 gas (~0.00020 BNB @1 gwei). Saran funding deployer: 0.02 BNB.
- User TIDAK punya akses ke builder/state file dari chat → laporan builder harus berisi SEMUA materi review ditempel lengkap (kode kontrak, draf dokumentasi agent, materi submit), bukan sekadar path file.
