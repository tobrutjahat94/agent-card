# AgentCard — hackathon submission draft

**Submit via the "Submit Project Now" button on the official Binance announcement page:**
<https://www.binance.com/en/support/announcement/detail/95f5dbe0ea674a48a739b59e046648bf>
Submission period: **18 Nov 15:00 – 9 Dec 15:00 WIB** (08:00 UTC). One project per team.

## Project name

AgentCard

## Website

<https://tobrutjahat94.github.io/agent-card/>

## Contract addresses

| Network | Contract | Address |
| --- | --- | --- |
| BNB Chain mainnet (56) | AgentCard | `TODO — deployed directly by the wallet owner (see README "Deploy preparation")` |
| BNB Chain mainnet (56) | Agent ID (official, used by AgentCard) | `0x60b9262456de011f7d15a54cdd8c48baaa8b022f` |
| BSC testnet (97) | AgentCard | `TODO — after testnet deploy (needs ~0.05 tBNB funding)` |
| BSC testnet (97) | MockAgentID (test only) | `TODO` |

Source code: <https://github.com/tobrutjahat94/agent-card> (public, MIT). BscScan verification after each deploy.

## Agent ID usage description

AgentCard is a one-shot on-chain registry for Agent ID holders. Each holder registers exactly once by calling `register(tokenId, endpoint, message)`:

- **Gate + binding:** the contract requires `balanceOf(msg.sender) > 0` on the official Agent ID contract **and** `ownerOf(tokenId) == msg.sender`, so the card is bound to the holder's specific Agent ID token — proof of ownership of that token, not just "holds any ID".
- **Identity as data:** the card stores the Agent ID tokenId, a public agent endpoint, and a short message on-chain, forming a public directory of agents keyed by Agent ID. One Agent ID = one card (enforced on-chain; Agent IDs are one per user and non-transferable, so there is no farming surface).
- **Why one-shot:** the Agentic Wallet does not sign arbitrary contract calls by default; custom calls need Developer Mode (manual opt-in in the App, 7-day expiry, per-operation confirmation). A daily check-in is unrealistic under those constraints, so the product is a single registration done through Developer Mode (`baw contract-call preview` → `execute`) by the holder's own AI agent. There is no website-register path: the website is a read-only directory, because Agent ID holders keep their wallet in the Binance App and a browser "connect wallet" button cannot reach them.
- **No name lookup:** no `.ai` name is stored on-chain and there is no name → address search in the contract or the UI, per the hackathon rules. The Agent ID contract has no on-chain enumeration (`tokenOfOwnerByIndex` does not exist), so holders find their tokenId off-chain (BscScan "ERC-721 Token Txns") and the contract verifies ownership.
- **Finding peers (practicality):** any agent can find a peer with one on-chain read — `endpointOf(address)` returns that agent's public endpoint, and `getCard(address)` returns the full card (token number, endpoint, message, registration time). Example: pick a wallet from the directory, call `endpointOf` for it, fetch the returned `https://` endpoint — that is the peer agent.

## Awards targeted

- **Agent Application Innovation Award (primary target)** (judge panel, 100 points: Agent ID depth 30%, practicality 25%, completion 25%, innovation 20%) — needs the product live + at least **30 Agent ID addresses** interacting during the submission period.
- **Agent ID Ecosystem Pioneer Award (secondary — hard to chase)** (usage ranking: interacting Agent ID addresses, tx count/volume) — needs holders to register during the submission period. One-shot registration means roughly one transaction per holder, so the tx/volume ranking is difficult to win with this design; the realistic goal is the address count, not the volume rank.

## Reward receiving address

`TODO — user fills in (the address that should receive USDC if the project wins)`

## Team

Solo builder, GitHub `tobrutjahat94`. Agent ID holder: Sanusinakamoto.ai.

## Promotion Award (separate, optional)

A post about AgentCard on X with `#BinanceWalletHackathon` and `#AgenticWallet`, then submit the X link via the official campaign survey at `app.binance.com` (linked from the announcement). 20 winners share 2,000 USDC. The post is drafted (a draft may be checked by Claude), **decided and posted by the human owner of the account — never by a bot**. The Promotion Award is for community posts reviewing other projects; it is not a channel to rely on for attracting holders.

## Outreach rules (how holders are invited)

- Holders are found in the **official Discord or Telegram of Binance Wallet and BNB Chain**. Read each group's own rules about promotion before posting there. No dedicated Agent ID group is claimed — none is verified.
- Every outreach message states plainly that this is a hackathon entry and who made it (AgentCard by `tobrutjahat94`, repo https://github.com/tobrutjahat94/agent-card, BscScan-verified contract, README "Owner permissions" — the contract has no owner).
- Every outreach message explains exactly what is signed: one `register()` call, value 0 BNB, gas only, no approval, cannot be undone; the card is permanent and public.
- Never ask for anything sensitive — seed phrase, API secret, pairing code, or QR login — anywhere, including by DM. That is a red line.
- Never promise a reward or a return; never use "passive income" or "automatic money-making" language.
- Never offer prizes or rewards for registering (manipulated volume/interaction can disqualify the project).
- Never use "Binance" or "BNB" in an account name, project name, or domain. Saying "Binance Agent ID Hackathon" to explain the event is fine. Hashtags `#BinanceWalletHackathon` and `#AgenticWallet` may be used.
