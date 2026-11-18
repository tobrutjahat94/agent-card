# AgentCard — one-shot on-chain agent card for Agent ID holders

Built for the **Binance Agent ID Hackathon** (submission period **18 Nov 15:00 – 9 Dec 15:00 WIB**, i.e. 08:00 UTC). Total rewards 60,000 USDC.

AgentCard is a public registry where each Agent ID holder registers exactly once. The card is bound to the holder's **specific** Agent ID token and stored on-chain: tokenId, public endpoint, and a short message. One Agent ID = one card. No payments, no token, no upkeep.

## Why one-shot (and not daily check-in)

The first design was a daily check-in. It was dropped for a practical reason: the **Agentic Wallet does not sign arbitrary transactions by default**. A custom contract call only works through **Developer Mode**, which must be enabled manually in the Binance App, expires after 7 days, needs a confirmation per operation, and has its own daily limit. A daily streak that requires re-enabling a mode and confirming every day is not a product Agent ID holders can realistically keep up — and a static "connect wallet" button cannot reach them at all, because their wallet lives in the App, not in a browser extension.

So AgentCard is a **one-shot interaction**: one `register()` call, done through Developer Mode (`baw contract-call preview` → `execute`) or from a normal wallet on the website. That is also a better fit for the hackathon's "Agent ID Application Depth" criterion (30%): the Agent ID is the product's primary key, not a gate in front of something else.

## How Agent ID is used (deeper than a gate)

`register(uint256 tokenId, string endpoint, string message)`:

1. `balanceOf(msg.sender) > 0` — the caller must hold an Agent ID.
2. `ownerOf(tokenId) == msg.sender` — the caller must own **that specific** Agent ID token. The card is proof of ownership of the token, not just "holds any ID".
3. One card per address and one card per tokenId — enforced on-chain.
4. The card (tokenId, endpoint, message, timestamp) is stored on-chain and emitted as a `CardRegistered` event, forming a public directory of agents keyed by Agent ID.

The Agent ID contract itself was checked before this design was finalized (see `NOTES.md`):

- `balanceOf`, `ownerOf`, `tokenURI`, `name()` ("SPACE ID Agent ID"), `symbol()` ("AI") all confirmed on-chain.
- **No ERC721Enumerable**: no `tokenOfOwnerByIndex`, no `totalSupply`, no `tokenByIndex` — `supportsInterface(0x780e9d63)` reverts. So a holder's tokenId cannot be enumerated on-chain; it is found off-chain (BscScan "ERC-721 Token Txns" tab, the website's auto-detect, or `scripts/find-token-id.js`) and passed in by the caller. The contract verifies ownership, so a wrong tokenId simply reverts.
- **No name is stored on-chain and there is no name lookup.** The hackathon rules forbid packaging Agent ID as a tool for looking up people's wallets by name, so AgentCard deliberately has no name → address mapping, no search function, and no search box in the UI. The directory lists cards by wallet address and tokenId only. (The website shows the connected wallet's *own* `.ai` name, resolved from its own token's metadata, as a convenience — nothing more.)

## Owner permissions

**There is no owner, and the contract has no owner functions at all.** Explicitly:

- No owner address, no admin role, no `onlyOwner` functions — the contract contains no function that only a specific address can call.
- No pause, no upgrade, no mint, no tax, no fee, no fund custody, no withdrawal.
- The deployer has no special powers after deployment. The only state-changing function is `register()`, callable by any Agent ID holder for their own card only.
- The Agent ID contract address is `immutable`, set once in the constructor. On mainnet it must be the official `0x60b9262456de011f7d15a54cdd8c48baaa8b022f`. On testnet (where the official contract does not exist) a `MockAgentID` is used instead — see `contracts/mocks/MockAgentID.sol`, clearly labeled TEST ONLY.

## Deploy preparation — the wallet owner runs this directly

Mainnet deployment is **not** something approved or executed through chat. It is executed directly by the human wallet owner, using the materials prepared here. The bot never deploys and never asks for chat approval as a substitute.

**Requirements for the deploy:**

1. **Dedicated deployer wallet.** Create a **new** wallet used only for this deploy, funded with just enough BNB for gas (see estimate below). **Not** the main wallet. Its private key must **never** appear in chat, in the repo, or in any state file.
2. **Verify the source on BscScan immediately after deploy.** Verification is an eligibility requirement for the hackathon — do it in the same session as the deploy (see steps below).
3. **Owner permissions are documented above** — the contract has no owner functions at all.
4. **Do not change the contract after interactions begin.** A new version is a new address, and the interaction count restarts from zero. That is why the logic is tested thoroughly on testnet first.
5. **One contract only.** One team submits one project, and only the submitted contract address counts toward the awards.

**Gas estimate (measured locally, 18 Nov 2026):**

| Operation | Gas | ~Cost at 1 gwei | ~Cost at 3 gwei |
| --- | --- | --- | --- |
| Deploy AgentCard | 1,307,491 | 0.00131 BNB | 0.00392 BNB |
| One `register()` call | 195,038 | 0.00020 BNB | 0.00059 BNB |

Fund the deployer wallet with **0.02 BNB** — that covers the deploy, verification, and several test registrations with wide margin. (Measured with `scripts/estimate-gas.js`; mainnet gas price varies, so keep the margin.)

**Steps for the wallet owner:**

```bash
# 1. From the repo root, install dependencies (once):
npm install

# 2. Deploy from the dedicated deployer wallet (mainnet, chain 56):
MAINNET_PRIVATE_KEY=<dedicated deployer key, never shared> \
  npx hardhat run scripts/deploy-mainnet.js --network bsc

# 3. Verify the source on BscScan immediately (same session):
npx hardhat verify --network bsc <AgentCard address> <Agent ID address>
# Agent ID address (mainnet): 0x60b9262456de011f7d15a54cdd8c48baaa8b022f

# 4. Record the deployed address in deployments/bscMainnet.json (written by
#    the script) and in docs/app.js (CONFIG[56].agentCard + deployBlock),
#    then update the website and SUBMISSION.md.
```

After deploy, the holder test (one Agent ID holder registers via Developer Mode) checks two things: that a holder can call the contract at all, and that the transaction passes Binance's risk check (a new unknown contract can be blocked, code `351803`). See `docs/AGENT-GUIDE.md` for the exact test steps.

## Repo layout

```
contracts/AgentCard.sol        # the registry (no dependencies)
contracts/mocks/MockAgentID.sol# testnet-only stand-in for the Agent ID contract
test/AgentCard.test.js         # 11 unit tests (Hardhat)
scripts/deploy-testnet.js      # BSC testnet deploy + mock mint + test register
scripts/deploy-mainnet.js      # BSC mainnet deploy (wallet owner runs directly; bot never runs it)
scripts/build-register-calldata.js # builds register() calldata + baw commands, dry-runs it
scripts/find-token-id.js       # finds a holder's Agent ID tokenId via Transfer events
scripts/gen-testnet-wallet.js  # throwaway TESTNET-ONLY deployer wallet
docs/index.html + app.js       # static website (GitHub Pages)
docs/AGENT-GUIDE.md            # step-by-step guide for Agent ID holders
deployments/                   # deployed addresses (public info)
```

## Status

| Item | Status |
| --- | --- |
| Contract + tests | Done — 11/11 passing (`npx hardhat test`), compiles on 0.8.28 |
| Deploy script (local proof) | Done — full flow verified on the local Hardhat network (deploy mock, mint, register, read card) |
| BSC testnet deploy | **Blocked on funding** — throwaway deployer `0x35ba4f36d3A1CDc99D9dAFc9d4aA9FE11234a364` has 0 tBNB. Fund ~0.05 tBNB from the official faucet (<https://www.bnbchain.org/en/testnet-faucet>), then run `TESTNET_PRIVATE_KEY=<key> npx hardhat run scripts/deploy-testnet.js --network bscTestnet`. Key file: `deployments/testnet-deployer.json` (600, git-ignored, testnet-only throwaway — never use on mainnet). Note: testnet proves contract logic only. The Agentic Wallet path cannot be tested on testnet (Agentic Wallet supports mainnet chains only). |
| BSC mainnet deploy | **Not run — executed directly by the human wallet owner** from the prepared materials (see "Deploy preparation" above). No chat approval is involved; the bot never deploys. Deploy early: interactions only count during the submission period. |
| Mainnet holder test | Planned after deploy: one Agent ID holder registers via Developer Mode. Test objectives: (1) the holder can call the contract at all, (2) the transaction passes Binance's risk check (a new unknown contract can be blocked, code `351803`), (3) the card is recorded. See `docs/AGENT-GUIDE.md`. |
| BscScan verification | After each deploy: `npx hardhat verify --network <network> <address> <constructor args>` (Sourcify enabled; BscScan API key optional). |
| Submission | Via the **"Submit Project Now"** button on the official Binance announcement page. Draft materials: `SUBMISSION.md`. Deadline **9 Dec 15:00 WIB**. |

## Run it locally

```bash
npm install
npx hardhat compile
npx hardhat test
```

## Website

Static site in `docs/` (GitHub Pages). Fill in the deployed contract addresses in `docs/app.js` (`CONFIG`) after deploy.

## Rules we follow

- No account farming: Agent IDs are one per user and non-transferable; the contract enforces one card per token. Do not create extra accounts to register more cards.
- No name → wallet lookup, anywhere.
- No QR-code login, no session storage, no prompts that bypass transaction confirmation, no hidden approvals, no collection of seeds/keys/API secrets.
- No promises of returns.
- Project name, token name and domain do not use "Binance" or "BNB".

## Links

- Hackathon announcement: <https://www.binance.com/en/support/announcement/detail/95f5dbe0ea674a48a739b59e046648bf>
- Agent ID contract (BNB Chain): `0x60b9262456de011f7d15a54cdd8c48baaa8b022f`
- Website: <https://tobrutjahat94.github.io/agent-card/>
