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
- **Why one-shot:** the Agentic Wallet does not sign arbitrary contract calls by default; custom calls need Developer Mode (manual opt-in in the App, 7-day expiry, per-operation confirmation). A daily check-in is unrealistic under those constraints, so the product is a single registration done through Developer Mode (`baw contract-call preview` → `execute`) or from a normal wallet on the website.
- **No name lookup:** no `.ai` name is stored on-chain and there is no name → address search in the contract or the UI, per the hackathon rules. The Agent ID contract has no on-chain enumeration (`tokenOfOwnerByIndex` does not exist), so holders find their tokenId off-chain (BscScan "ERC-721 Token Txns") and the contract verifies ownership.

## Awards targeted

- **Agent ID Ecosystem Pioneer Award** (usage ranking: interacting Agent ID addresses, tx count/volume) — needs holders to register during the submission period.
- **Agent Application Innovation Award** (judge panel, 100 points: Agent ID depth 30%, practicality 25%, completion 25%, innovation 20%) — needs the product live + at least **30 Agent ID addresses** interacting during the submission period.

## Reward receiving address

`TODO — user fills in (the address that should receive USDC if the project wins)`

## Team

Solo builder, GitHub `tobrutjahat94`. Agent ID holder: Sanusinakamoto.ai.

## Promotion Award (separate, optional)

Post about AgentCard on X with `#BinanceWalletHackathon` and `#AgenticWallet`, then submit the X link via the official campaign survey at `app.binance.com` (linked from the announcement). 20 winners share 2,000 USDC.
