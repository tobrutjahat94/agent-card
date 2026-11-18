# Holder agent prompt — AgentCard

**How to use this file:** fill in the 5 values in `[SQUARE BRACKETS]` below,
then copy the whole prompt block (from `Register my AgentCard` to the last
line) and paste it to your own AI agent. Your agent does the technical work;
you only confirm in the Binance App when it asks you.

- `[YOUR AGENTIC WALLET ADDRESS]` — your Agentic Wallet address (the one that holds your Agent ID).
- `[AGENTCARD CONTRACT ADDRESS]` — the deployed AgentCard address from the AgentCard website / README. Do not register until the website shows it as live and BscScan shows its source code as verified.
- `[YOUR TOKEN NUMBER]` — your Agent ID tokenId, from BscScan (your address page → ERC-721 Token Txns).
- `[YOUR ENDPOINT]` — your agent's public endpoint, an `https://` URL, max 200 characters.
- `[YOUR MESSAGE]` — your short public message, max 280 characters. Permanent — choose text you are happy to keep public forever.

---

## The prompt — copy everything below this line

```
Register my AgentCard (Binance Agent ID Hackathon, one-shot on-chain agent card).

My details:
- My Agentic Wallet address: [YOUR AGENTIC WALLET ADDRESS]
- AgentCard contract (BNB Chain, chain 56): [AGENTCARD CONTRACT ADDRESS]
- Agent ID contract (official): 0x60b9262456de011f7d15a54cdd8c48baaa8b022f
- My Agent ID token number: [YOUR TOKEN NUMBER]
- My public agent endpoint: [YOUR ENDPOINT]
- My public message: [YOUR MESSAGE]

Do this, in order, and do not skip a step:

1. Install the Binance Agentic Wallet skill if it is not installed yet:
   npx skills add binance/binance-skills-hub/skills/binance-web3/binance-agentic-wallet
   Then sign me in to my Binance Agentic Wallet if I am not signed in. I will
   approve the pairing in the Binance App.

2. Check my wallet settings with `baw wallet settings --json` and confirm
   Developer Mode is enabled (`devMode.enabled: true`) and not expired
   (`devMode.expiresAt` in the future). Also confirm Abnormal Transaction
   Handling is set to Need Confirmation. If Developer Mode is off or expired,
   STOP and tell me to turn it on in the Binance App (Agentic Wallet ->
   Settings -> Developer Mode, then confirm the Risk Warning) and set
   Abnormal Transaction Handling to Need Confirmation. Do not continue
   until I confirm it is on.

3. Verify on-chain, read-only, that I hold an Agent ID and own this token:
   call balanceOf([YOUR AGENTIC WALLET ADDRESS]) and
   ownerOf([YOUR TOKEN NUMBER]) on the Agent ID contract above. If either
   check fails, STOP and tell me why.

4. Build the register() calldata with the AgentCard repo helper (clone
   https://github.com/tobrutjahat94/agent-card if you do not have it):
   node scripts/build-register-calldata.js --from [YOUR AGENTIC WALLET ADDRESS] --to [AGENTCARD CONTRACT ADDRESS] --tokenId [YOUR TOKEN NUMBER] --endpoint "[YOUR ENDPOINT]" --message "[YOUR MESSAGE]"
   Only continue if its dry run says register() would SUCCEED. If it says
   it would revert, STOP and show me the revert reason.

5. Run the preview and SHOW IT TO ME BEFORE ANYTHING IS SIGNED:
   baw contract-call preview --binanceChainId 56 --from [YOUR AGENTIC WALLET ADDRESS] --to [AGENTCARD CONTRACT ADDRESS] --value 0 --inputData <calldata from step 4> --json
   Show me: the contract address, the token number, the endpoint, the
   message, the gas cost, simulationResult.simulationCode, and every risk
   item. If the preview is blocked (code 351803) or returns no requestId,
   STOP, do not execute, and show me the blockReason.

6. WAIT for my explicit "yes" in this chat. Do not execute before I say yes.

7. Only after my yes, execute:
   baw contract-call execute --requestId <requestId from the preview> --json
   If the result is PENDING_CONFIRMATION, tell me to approve it in the
   Binance App. If it says the preview expired, go back to step 5 with a
   fresh preview.

8. After the transaction confirms, verify my card on-chain: call
   endpointOf([YOUR AGENTIC WALLET ADDRESS]) and
   getCard([YOUR AGENTIC WALLET ADDRESS]) on the AgentCard contract and
   show me the token number, endpoint, message, and the BscScan
   transaction link. The card is permanent and cannot be changed — if
   anything in the preview did not match my details above, tell me
   BEFORE step 6, not after.

Safety rules for this whole task:
- Never ask me for my seed phrase, private key, password, or pairing code.
  Never paste them anywhere. If a step asks for one, it is a scam — stop.
- Never change the contract address, token number, endpoint, or message
  from the values I gave above. If a check says they are wrong, stop and
  tell me instead of "fixing" them yourself.
- The transaction value must be 0 BNB (gas only). Never approve a payment.
- One Agent ID = one card. Never register a second card for me, and never
  create extra accounts or wallets to register more cards.
```

## The prompt — copy everything above this line
