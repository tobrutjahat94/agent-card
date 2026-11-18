// Build the register() calldata for AgentCard and print the exact
// `baw contract-call` commands for an Agent ID holder (Developer Mode).
// Also dry-runs the call with eth_call (staticCall) so the holder knows
// BEFORE previewing whether register() would succeed.
// Read-only: no keys, no signing, no transactions.
// Usage:
//   node scripts/build-register-calldata.js \
//     --from <your agentic wallet address> \
//     --to <AgentCard contract address> \
//     --tokenId <your Agent ID token id> \
//     --endpoint <public agent endpoint URL> \
//     --message <short public message> [--rpc <bsc rpc url>]
const { ethers } = require("ethers");

const ABI = [
  "function register(uint256 tokenId, string endpoint, string message)",
  "function hasCard(address) view returns (bool)",
  "function getCard(address) view returns (uint256,string,string,uint256)",
  "function agentId() view returns (address)",
];
const AGENT_ID = "0x60b9262456de011f7d15a54cdd8c48baaa8b022f";
const AGENT_ID_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function ownerOf(uint256) view returns (address)",
];

function arg(name) {
  const i = process.argv.indexOf("--" + name);
  if (i === -1 || !process.argv[i + 1]) {
    console.error("Missing --" + name);
    process.exit(1);
  }
  return process.argv[i + 1];
}

async function main() {
  const from = arg("from");
  const to = arg("to");
  const tokenId = arg("tokenId");
  const endpoint = arg("endpoint");
  const message = arg("message");
  const rpc = process.argv.includes("--rpc")
    ? arg("rpc")
    : "https://bsc-dataseed.binance.org";
  if (!ethers.isAddress(from) || !ethers.isAddress(to)) {
    throw new Error("from/to must be valid addresses");
  }
  if (endpoint.length > 200) throw new Error("endpoint > 200 bytes");
  if (message.length > 280) throw new Error("message > 280 bytes");

  const provider = new ethers.JsonRpcProvider(rpc);
  const card = new ethers.Contract(to, ABI, provider);
  const agentId = new ethers.Contract(AGENT_ID, AGENT_ID_ABI, provider);

  console.log("Holder:", from);
  console.log("AgentCard:", to);
  console.log("Agent ID balance:", (await agentId.balanceOf(from)).toString());
  console.log("ownerOf(tokenId):", await agentId.ownerOf(tokenId));
  console.log("Already has a card:", await card.hasCard(from));

  const iface = new ethers.Interface(ABI);
  const data = iface.encodeFunctionData("register", [tokenId, endpoint, message]);
  console.log("\nCalldata:");
  console.log(data);

  // Dry run: staticCall from the holder's address.
  try {
    await card.register.staticCall(tokenId, endpoint, message, { from });
    console.log("\nDry run: register() would SUCCEED (staticCall passed).");
  } catch (e) {
    console.log("\nDry run: register() would REVERT:", (e.reason || e.message || e).toString().slice(0, 300));
    console.log("Do NOT preview/execute until the revert reason is fixed.");
    return;
  }

  console.log("\n--- Developer Mode flow (Binance App Agentic Wallet) ---");
  console.log("1. Enable Developer Mode in the App first (see AGENT-GUIDE.md).");
  console.log("2. Preview (shows simulation + risks — read them before confirming):");
  console.log(
    `   baw contract-call preview --binanceChainId 56 --from ${from} --to ${to} --value 0 --inputData ${data} --json`
  );
  console.log("3. After a clear YES on the preview, execute with the requestId:");
  console.log("   baw contract-call execute --requestId <requestId from preview> --json");
  console.log("4. Check the receipt, then verify your card on the AgentCard site.");
}

main().catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});
