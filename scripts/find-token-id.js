// Find the Agent ID tokenId(s) owned by an address on BNB Chain mainnet.
// The Agent ID contract is NOT ERC721Enumerable (no tokenOfOwnerByIndex),
// so the tokenId must be found by scanning Transfer events.
// Read-only: no keys, no signing, no transactions.
// Usage: node scripts/find-token-id.js <address> [startBlock]
//
// The contract was deployed around Oct 2026 (~block 132,500,000); the
// default scan starts there. Chunked so public RPCs accept the range.
//
// NOTE (tested 18 Nov 2026): Binance's public dataseed endpoints rate-limit
// eth_getLogs from this VM (code -32005), so this helper may fail here even
// with retries. The RELIABLE path for a holder is BscScan: open your address
// page -> "ERC-721 Token Txns" tab -> the Agent ID transfer shows the tokenId.
// (The AgentCard website is a read-only directory — it has no auto-detect
// and never connects a wallet.)
const { ethers } = require("ethers");

const AGENT_ID = "0x60b9262456de011f7d15a54cdd8c48baaa8b022f";
const RPCS = [
  "https://bsc-dataseed.binance.org",
  "https://bsc-dataseed1.defibit.io",
  "https://bsc-dataseed1.ninicoin.io",
];
const TRANSFER = ethers.id("Transfer(address,address,uint256)");
const CHUNK = 10000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getLogsWithRetry(provider, filter, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      return await provider.getLogs(filter);
    } catch (e) {
      const msg = (e.message || "").slice(0, 160);
      if (i === tries - 1) throw e;
      console.log(`  getLogs rate-limited (${msg}), retrying in ${2 * (i + 1)}s...`);
      await sleep(2000 * (i + 1));
    }
  }
}

async function main() {
  const address = process.argv[2];
  if (!address || !ethers.isAddress(address)) {
    console.error("Usage: node scripts/find-token-id.js <address> [startBlock]");
    process.exit(1);
  }
  const startBlock = parseInt(process.argv[3] || "132500000", 10);

  const provider = new ethers.JsonRpcProvider(RPCS[0]);
  const latest = await provider.getBlockNumber();
  console.log("Scanning Transfer events to", address, "from block", startBlock, "to", latest);

  const found = [];
  for (let from = startBlock; from <= latest; from += CHUNK) {
    const to = Math.min(from + CHUNK - 1, latest);
    const logs = await getLogsWithRetry(provider, {
      address: AGENT_ID,
      topics: [TRANSFER, null, ethers.zeroPadValue(address.toLowerCase(), 32)],
      fromBlock: from,
      toBlock: to,
    });
    for (const log of logs) {
      const tokenId = BigInt(log.topics[3]).toString();
      if (!found.includes(tokenId)) found.push(tokenId);
      console.log("  block", log.blockNumber, "-> tokenId", tokenId);
    }
    await sleep(1200); // stay under the public RPC rate limit
  }
  if (found.length === 0) {
    console.log("No Agent ID token found for this address in the scanned range.");
    console.log("Check on BscScan instead: address page -> 'ERC-721 Token Txns' tab.");
  } else {
    console.log("Agent ID tokenId(s):", found.join(", "));
  }
}

main().catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});
