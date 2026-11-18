# Agent Guide — Registering your AgentCard

**DRAFT for review. Contract addresses below are placeholders until the mainnet deploy is done.**

This guide is for Agent ID holders who want to register an AgentCard. It is written so anyone can follow it in a few steps. No technical background needed beyond using the Binance App.

---

## What is AgentCard?

AgentCard is a one-shot on-chain registry for Agent ID holders, built for the Binance Agent ID Hackathon.

- **One registration, once.** You call a single function, `register()`, one time. There is no daily check-in and nothing to maintain afterwards.
- **Your card is bound to your Agent ID token.** The contract checks on-chain that you own the specific Agent ID token you register with. Your card is proof you own that Agent ID.
- **Your card is public.** It stores three things on-chain: your Agent ID token number, a public endpoint where your agent can be reached (a URL), and a short public message. Anyone can read it. Nothing else about you is recorded.
- **It costs only gas.** A few cents of BNB. There is no payment to anyone, no token to buy, and no approval that lets anything spend your funds.
- **It cannot be changed or deleted.** Registration is permanent. Think before you register: the endpoint and message you choose stay as they are.

### What registering does NOT do

- It does **not** move, lock, or touch your funds or your Agent ID.
- It does **not** ask for your seed phrase, private key, or any password. Anyone asking for those is a scam.
- It does **not** give anyone permission to act on your behalf.
- It does **not** make your wallet searchable by name. There is no name search anywhere in this project — by design.

---

## Before you start (checklist)

1. **You hold an Agent ID.** Claim it in the Binance App first if you have not: Wallet → homepage banner → Agent ID. One Agent ID per user; it is non-transferable.
2. **You have a little BNB** in your Agentic Wallet for gas (a registration costs a fraction of a dollar in gas).
3. **Developer Mode is on** (Step 1 below). The Agentic Wallet does not sign custom contract calls by default — Developer Mode is the official way to do it.
4. **You know your Agent ID token number** (Step 2 below).

Contract addresses (fill in after deploy):

| Item | Address |
| --- | --- |
| AgentCard (BNB Chain mainnet) | `TODO — after mainnet deploy` |
| Agent ID (official, BNB Chain) | `0x60b9262456de011f7d15a54cdd8c48baaa8b022f` |

---

## Step 1 — Turn on Developer Mode (Binance App, ~2 minutes)

Developer Mode is what lets your Agentic Wallet call a custom contract. It is an official Binance App feature. It **cannot** be turned on from a computer — only in the App on your phone.

1. Open the **Binance App** → open your **Agentic Wallet** (the wallet that holds your Agent ID).
2. Go to the Agentic Wallet management page → tap **Settings** (top-right icon).
3. Turn on **Developer Mode**.
4. Read the **Risk Warning** and confirm it.
5. Approve the signature request the App shows.

What to know about Developer Mode:

- **It lasts 7 days.** Each successful use extends it. If it expires, turn it on again the same way.
- **It has its own daily limit** (in USDT), separate from your normal wallet limits. A registration is tiny (gas only), so the lowest limit is more than enough. The App offers 1,000 / 5,000 / 10,000 / 50,000 USDT.
- **Your wallet balance must be under the Developer Mode balance cap**, otherwise the App refuses to turn it on. If that happens, move funds out first and try again.
- **Every operation needs your confirmation.** Nothing is signed silently.

Check it worked: run `baw wallet settings --json` and confirm `devMode.enabled: true` and `devMode.expiresAt` is in the future. If you do not use the `baw` CLI, skip this check — the App itself shows Developer Mode as on.

---

## Step 2 — Find your Agent ID token number

Your Agent ID is an NFT with a number (tokenId). You need that number to register. There are three ways; use whichever is easiest.

### Way A — BscScan (most reliable, 2 minutes)

1. Open [bscscan.com](https://bscscan.com) and paste your Agentic Wallet address in the search bar.
2. Open the **ERC-721 Token Txns** tab on your address page.
3. Find the row where the token is the Agent ID contract (`0x60b9…022f`). The **Token ID** column shows your number (for example `12345`).
4. Write it down — you will type it into the registration.

### Way B — The AgentCard website (automatic)

1. Open the AgentCard website and connect your wallet.
2. Click **Auto-detect my tokenId**. The site scans your incoming Agent ID transfers and fills the number in.
3. If auto-detect finds nothing (some wallet RPCs block event scans), use Way A.

### Way C — Helper script (if you use the `baw` CLI)

```bash
node scripts/find-token-id.js <your wallet address>
```

It prints your tokenId(s). It is read-only and never asks for keys.

---

## Step 3 — Register your card

Pick **one** of the two options. Both do exactly the same thing: one `register()` call.

### Option A — Website button (normal wallets)

Use this if you are registering from a regular wallet (for example MetaMask) that holds an Agent ID.

1. Open the AgentCard website, connect your wallet, make sure you are on **BNB Chain** (chain 56).
2. Enter your tokenId (Step 2), your public endpoint URL (max 200 characters), and your short message (max 280 characters).
3. Click **Register my card**. Your wallet shows the transaction — check that:
   - the **To** address is the AgentCard contract from the table above,
   - the **value** is 0 BNB (only gas),
   - the function is `register`.
4. Confirm in your wallet. Wait for the confirmation, then check Step 4.

### Option B — `baw contract-call` (Agentic Wallet, Developer Mode)

Use this if your Agent ID lives in the Agentic Wallet. This is a two-step flow on purpose: preview first, execute only after you have read the preview.

**3.1 — Build the call data (on your computer, no keys needed):**

```bash
node scripts/build-register-calldata.js \
  --from <your agentic wallet address> \
  --to <AgentCard contract address> \
  --tokenId <your token number> \
  --endpoint "https://your-agent.example" \
  --message "One short public message about your agent"
```

The script prints three things: your Agent ID balance, a dry-run result, and the exact preview command. **Only continue if the dry run says the call would succeed.** If it says it would revert, stop and fix the reason shown (usually: no Agent ID on that address, wrong tokenId, or already registered).

**3.2 — Preview (read this before you confirm anything):**

```bash
baw contract-call preview --binanceChainId 56 --from <your agentic wallet address> --to <AgentCard contract address> --value 0 --inputData <calldata from the script> --json
```

Read the preview output and check:

- `parsedTx.contractAddress` is the AgentCard contract from the table above.
- `simulationResult.simulationCode` shows the simulation passed.
- `risks` — read any risk items. If the preview is blocked (`351803`, risk-blocked), **do not execute**; report it to the project team.
- `requireConfirmation` tells you whether the App will ask you to approve again after executing.

The preview returns a `requestId`. Keep it.

**3.3 — Execute (only after a clear yes on the preview):**

```bash
baw contract-call execute --requestId <requestId from the preview> --json
```

Possible results:

- `BROADCASTED` with a `txHash` — the transaction was signed and sent. Go to Step 4.
- `PENDING_CONFIRMATION` — open the Binance App and approve the transaction there, then check the hash.

If execute says the preview expired, run the preview again and execute with the new `requestId`.

---

## Step 4 — Verify your card

1. Open the transaction hash on BscScan. It should show **Success**.
2. Open the AgentCard website → Directory. Your card appears with your wallet address, token number, endpoint, and message.
3. Done. There is nothing else to do — no check-in tomorrow, no upkeep.

---

## Troubleshooting

| What you see | What it means | What to do |
| --- | --- | --- |
| `351801` / `351802`, or Developer Mode shows off | Developer Mode is off or expired | Turn it on again in the App (Step 1). It lasts 7 days. |
| `351803` / `AGENT_DEV_MODE_RISK_BLOCKED` | Binance risk control blocked the transaction | **Stop. Do not execute.** Report the `blockReason` to the project team. A brand-new contract can be flagged by the risk check; this is one of the things the mainnet test is for. |
| `351804` | Wallet balance is above the Developer Mode cap | Move funds until the balance is under the cap, then turn Developer Mode on again. |
| `351805` (simulation failed) | The call would fail on-chain, or the gas estimate was too low | Read the message. Usually it is one of the revert reasons below — check your tokenId and whether you already registered. |
| `351807` | Developer Mode daily limit reached | Raise the limit in the App (Agentic Wallet → Settings → Developer Mode limit) or try again tomorrow. |
| `AgentCard: caller holds no Agent ID` | That address holds no Agent ID | Register from the address that actually holds your Agent ID. |
| `AgentCard: not the owner of this Agent ID token` | The tokenId belongs to a different address | Use the tokenId that belongs to your address (Step 2). |
| `AgentCard: already registered` | This address already has a card | You are done — one card per Agent ID, and it cannot be changed. |
| `AgentCard: endpoint too long` / `message too long` | Over the 200 / 280 character limits | Shorten the text and try again (only if you have not registered yet). |
| Preview expired | Previews only live a short time | Run the preview again, then execute with the new `requestId`. |
| Website says “holds no Agent ID” | Connected wallet is not the Agent ID wallet | Switch to the address that holds your Agent ID. |

---

## Rules of the registry

- **One Agent ID = one card.** Agent IDs are one per user and non-transferable, so there is no way to register twice. Do not create extra accounts or wallets to register more cards — that is farming, and the hackathon disqualifies it.
- **No name search.** The directory lists cards by wallet address and token number. There is no way to search for someone's wallet by their `.ai` name, and there never will be.
- **Your card is permanent.** There is no edit and no delete — not for you, not for anyone. Only register an endpoint and message you are happy to keep public.

---

## Questions?

- Project repo: <https://github.com/tobrutjahat94/agent-card>
- Website: <https://tobrutjahat94.github.io/agent-card/>
- Hackathon announcement: <https://www.binance.com/en/support/announcement/detail/95f5dbe0ea674a48a739b59e046648bf>
- Submission period: **18 Nov 15:00 – 9 Dec 15:00 WIB** (08:00 UTC).
