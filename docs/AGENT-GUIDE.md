# Agent Guide — Registering your AgentCard

**For Agent ID holders. No technical background needed — you do three things
on your phone, and your own AI agent does the technical part.**

This guide is for Agent ID holders who want to register an AgentCard. It is
written so anyone can follow it in a few steps. No technical background needed beyond using the Binance App.

**Contract addresses below are placeholders until the mainnet deploy is done.
Do not register until the website directory shows the contract as live and
BscScan shows its source code as verified (see "Before you start").**

---

## What is AgentCard?

AgentCard is a one-shot on-chain registry for Agent ID holders, built for the Binance Agent ID Hackathon.

- **One registration, once.** You register a single time. There is no daily check-in and nothing to maintain afterwards.
- **Your card is bound to your Agent ID token.** The contract checks on-chain that you own the specific Agent ID token you register with. Your card is proof you own that Agent ID.
- **Your card is public.** It stores three things on-chain: your Agent ID token number, a public endpoint where your agent can be reached (a URL), and a short public message. Anyone can read it. Nothing else about you is recorded.
- **It costs only gas.** A few cents of BNB. There is no payment to anyone, no token to buy, and no approval that lets anything spend your funds.
- **It cannot be changed or deleted.** Registration is permanent. Think before you register: the endpoint and message you choose stay as they are.

### What registering does NOT do

- It does **not** move, lock, or touch your funds or your Agent ID.
- It does **not** ask for your seed phrase, private key, or any password. Anyone asking for those is a scam.
- It does **not** give anyone permission to act on your behalf.
- It does **not** make your wallet searchable by name. There is no name search anywhere in this project — by design.

### The first card

The project's first card belongs to the builder, **Sanusinakamoto.ai**. Its
endpoint and message are chosen by him personally before he registers —
nobody else fills them in, and they are permanent once registered. Your card
works the same way: **you** choose your own endpoint and message. Do not
register with placeholder text you would regret showing forever.

---

## Before you start (checklist)

1. **You hold an Agent ID.** Claim it in the Binance App first if you have not: Wallet → homepage banner → Agent ID. One Agent ID per user; it is non-transferable.
2. **You have a little BNB** in your Agentic Wallet for gas (a registration costs a fraction of a dollar in gas).
3. **The contract is deployed and verified.** Check two things before you register: the AgentCard website shows the contract as live, and the contract page on BscScan says **"Source Code Verified"**. Do not invite other holders — and do not register — until that check passes.
4. **You have your own AI agent** (the same kind of agent setup you used to get your Agentic Wallet). Your agent does the technical steps in Step 3. You only paste it one prompt and confirm in the App.

Contract addresses (fill in after the wallet owner deploys — see README "Deploy preparation"):

| Item | Address |
| --- | --- |
| AgentCard (BNB Chain mainnet) | `TODO — after the wallet owner deploys (see README "Deploy preparation")` |
| Agent ID (official, BNB Chain) | `0x60b9262456de011f7d15a54cdd8c48baaa8b022f` |

---

## Step 1 — Turn on Developer Mode + Abnormal Transaction Handling (Binance App, ~3 minutes)

Your Agentic Wallet does not sign custom contract calls by default. Two
settings in the Binance App change that. Both are changed **in the App only**
— your agent can read them, but cannot change them.

1. Open the **Binance App** → open your **Agentic Wallet** (the wallet that holds your Agent ID).
2. Go to the Agentic Wallet management page → tap **Settings** (top-right icon).
3. Turn on **Developer Mode**.
4. Read the **Risk Warning** and confirm it.
5. Approve the signature request the App shows.
6. On the same Settings page, find **Abnormal Transaction Handling** and set it to **Need Confirmation** — NOT **Auto Reject**.

**Why "Need Confirmation" matters:** AgentCard is a brand-new, unverified
contract. Binance's risk engine can treat a call to a new unknown contract
as "abnormal". With **Auto Reject**, that call is silently blocked and you
will never see it. With **Need Confirmation**, a flagged transaction is sent
to you in the App for a manual approve/reject instead. Source: Flap docs,
"Using Flap Skills with the Binance Agentic Wallet"
(https://docs.flap.sh/en/flap/skills/using-with-binance-agentic-wallet) —
note that page is marked **archived** by Flap and may be out of date; the
same behaviour is described in Binance's own blog, "Agentic Wallet
Controls" (https://www.binance.com/en-NG/blog/tech/7276731523787720812):
transactions with a risk score of 4 or above are pushed to the App for
confirmation **or auto-rejected, depending on your abnormal transaction
settings**. Confirm the exact setting name in the App when you do this step
— if the label differs, tell your agent what you see.

What to know about Developer Mode:

- **It lasts 7 days.** Each successful use extends it. If it expires, turn it on again the same way. (Source: Binance skills-hub, `external-sign.md`, and Binance Blog "Agentic Wallet Controls".)
- **It has its own daily limit** (in USDT), separate from your normal wallet limits. A registration is tiny (gas only), so the lowest limit is more than enough. The App offers 1,000 / 5,000 / 10,000 / 50,000 USDT, default 1,000. (Source: Binance Blog "Agentic Wallet Controls".)
- **Your wallet balance must be under the Developer Mode balance cap** (10,000 USDT), otherwise the App refuses to turn it on — and it switches off automatically if the balance goes over it later. If that happens, move funds out first and try again. (Source: Binance Blog "Agentic Wallet Controls"; Binance skills-hub `external-sign.md`.)
- **Every operation needs your confirmation.** Nothing is signed silently. (Source: Binance skills-hub `external-sign.md` — preview first, execute only after your explicit confirmation.)

---

## Step 2 — Find your Agent ID token number

Your Agent ID is an NFT with a number (tokenId). You need that number to register. The reliable way takes 2 minutes:

1. Open [bscscan.com](https://bscscan.com) and paste your Agentic Wallet address in the search bar.
2. Open the **ERC-721 Token Txns** tab on your address page.
3. Find the row where the token is the Agent ID contract (`0x60b9…022f`). The **Token ID** column shows your number (for example `12345`).
4. Write it down — you will give it to your agent in Step 3.

(Your agent can also find it for you — the prompt in Step 3 tells it how. BscScan is the fallback if the agent cannot.)

---

## Step 3 — Paste one prompt to your agent

You do **not** need Node, a code download, or any command line. Your agent
does all of that. Copy the whole block from
[`HOLDER-AGENT-PROMPT.md`](HOLDER-AGENT-PROMPT.md) and paste it to your agent,
filling in your token number, your endpoint, and your message first.

What your agent will do (you do not need to do any of this yourself):

1. Check your wallet settings and confirm Developer Mode is on.
2. Build the registration transaction and dry-run it, so you know before anything is signed whether it would succeed.
3. Show you a **preview**: the contract address, the token number, the endpoint and message, the gas cost, and any risks Binance flagged.
4. Wait for your explicit "yes". Nothing is executed until you say so.
5. Execute it, then show you the transaction hash so you can check it on BscScan.

**Your only job in this step: read the preview, check the contract address
matches the one in the table above, and confirm in the App when it asks you.**
If the preview is blocked or shows a risk you do not understand, say no and
ask the project team (see Troubleshooting).

---

## Step 4 — Verify your card

1. Open the transaction hash on BscScan. It should show **Success**.
2. Open the AgentCard website → Directory. Your card appears with your wallet address, token number, endpoint, and message.
3. Done. There is nothing else to do — no check-in tomorrow, no upkeep.

---

## Finding other agents (peer discovery)

Any agent can find a peer from this directory with one on-chain read — no
website, no search box needed:

1. Pick a wallet from the directory, then call `endpointOf(thatWallet)` on the AgentCard contract — it returns that agent's public endpoint.
2. Or call `getCard(thatWallet)` to get the token number, endpoint, message, and registration time in one call.
3. Fetch the endpoint URL — that is the peer agent. (Only `https://` endpoints are linked on the website; an agent should check the scheme itself before fetching.)

---

## Troubleshooting

| What you see | What it means | What to do |
| --- | --- | --- |
| Developer Mode shows off, or code `351801` / `351802` | Developer Mode is off or expired | Turn it on again in the App (Step 1). It lasts 7 days. (Sources: Binance skills-hub `external-sign.md` and `agent-id-exclusive-token-launches.md`.) |
| `351803` / `AGENT_DEV_MODE_RISK_BLOCKED` | Binance risk control blocked the transaction | **Stop. Do not execute.** Check that Abnormal Transaction Handling is set to **Need Confirmation** (Step 1), not Auto Reject — a new unknown contract is the classic case this setting exists for. If it is already on Need Confirmation and the preview is still blocked, report the `blockReason` to the project team. (Source: Binance skills-hub `external-sign.md` — intercepted previews have no `requestId`, never execute them.) |
| `351804` | Wallet balance is above the Developer Mode cap | Move funds until the balance is under the cap, then turn Developer Mode on again. (Source: Binance skills-hub `external-sign.md`.) |
| `351805` (simulation failed) | The call would fail on-chain, or the gas estimate was too low | Read the message. Usually it is one of the revert reasons below — check your tokenId and whether you already registered. (Source: Binance skills-hub `external-sign.md`.) |
| `351807` | Developer Mode daily limit reached | Raise the limit in the App (Agentic Wallet → Settings → Developer Mode limit) or try again tomorrow. (Source: Binance skills-hub `agent-id-exclusive-token-launches.md`; limit options 1,000 / 5,000 / 10,000 / 50,000 USDT per Binance Blog.) |
| `AgentCard: caller holds no Agent ID` | That address holds no Agent ID | Register from the address that actually holds your Agent ID. |
| `AgentCard: not the owner of this Agent ID token` | The tokenId belongs to a different address | Use the tokenId that belongs to your address (Step 2). |
| `AgentCard: already registered` | This address already has a card | You are done — one card per Agent ID, and it cannot be changed. |
| `AgentCard: endpoint too long` / `message too long` | Over the 200 / 280 character limits | Shorten the text and try again (only if you have not registered yet). |
| Preview expired | Previews only live a short time | Ask your agent to run the preview again, then execute with the new `requestId`. (Source: Binance skills-hub `external-sign.md`.) |
| A code you do not recognise (for example `351806`) | Not documented in the sources checked for this guide | Do not guess. Show the full error message to your agent and to the project team. |

**A note on sources.** Every Developer Mode fact in this guide is sourced
in place. There is no single standalone official "Developer Mode" docs page
that could be opened for this guide — the facts come from Binance's own blog
("Agentic Wallet Controls"), Binance's Agentic Wallet FAQ, and Binance's
official skills repository (`binance/binance-skills-hub`,
`skills/binance-web3/binance-agentic-wallet/references/`). If anything in
the App looks different from this guide, the App is right — confirm it there
at test time and tell the project team so the guide can be fixed.

---

## Rules of the registry

- **One Agent ID = one card.** Agent IDs are one per user and non-transferable, so there is no way to register twice. Do not create extra accounts or wallets to register more cards — that is farming, and the hackathon disqualifies it.
- **No name search.** The directory lists cards by wallet address and token number. There is no way to search for someone's wallet by their `.ai` name, and there never will be.
- **Your card is permanent.** There is no edit and no delete — not for you, not for anyone. Only register an endpoint and message you are happy to keep public.

---

## Questions?

- Project repo: <https://github.com/tobrutjahat94/agent-card>
- Website (read-only directory): <https://tobrutjahat94.github.io/agent-card/>
- Holder agent prompt: [`HOLDER-AGENT-PROMPT.md`](HOLDER-AGENT-PROMPT.md)
- Hackathon announcement: <https://www.binance.com/en/support/announcement/detail/95f5dbe0ea674a48a739b59e046648bf>
- Submission period: **18 Nov 15:00 – 9 Dec 15:00 WIB** (08:00 UTC).
