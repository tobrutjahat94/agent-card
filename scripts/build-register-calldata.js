// Build the register() calldata for AgentCard and print the exact
// `baw contract-call` commands for an Agent ID holder (Developer Mode).
// Also dry-runs the call with eth_call (staticCall) so the holder knows
// BEFORE previewing whether register() would succeed.
// Read-only: no keys, no signing, no transactions.
// This script is run by the HOLDER'S OWN AI AGENT (see
// docs/HOLDER-AGENT-PROMPT.md). The holder never runs it themselves:
// they paste one prompt to their agent, and the agent runs this.
// Usage (single quotes — double quotes break on $, backticks and "
// inside the message, because the shell expands them):
//   node scripts/build-register-calldata.js \
//     --from <your agentic wallet address> \
//     --to <AgentCard contract address> \
//     --tokenId <your Agent ID token id> \
//     --endpoint '<public agent endpoint URL, https:// only>' \
//     --message '<short public message>' [--rpc <bsc rpc url>]
// If the message (or endpoint) itself contains a single quote, pass it
// from a file instead — the file is read verbatim (one trailing newline
// is stripped):
//   node scripts/build-register-calldata.js ... --messageFile <path>
//   node scripts/build-register-calldata.js ... --endpointFile <path>
const { ethers } = require("ethers");
const { readFileSync } = require("node:fs");

const ABI = [
  "function register(uint256 tokenId, string endpoint, string message)",
  "function hasCard(address) view returns (bool)",
  "function getCard(address) view returns (uint256,string,string,uint256)",
  "function endpointOf(address) view returns (string)",
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

function hasArg(name) {
  return process.argv.includes("--" + name);
}

// Read a --*File argument as UTF-8 text, verbatim except for one
// trailing newline (a text file's final newline is not part of the
// message). Used when the value contains characters the shell would
// mangle in quotes (single quote, $, backtick, double quote, emoji).
function argFile(name) {
  const content = readFileSync(arg(name), "utf8");
  return content.replace(/\r?\n$/, "");
}

async function main() {
  const from = arg("from");
  const to = arg("to");
  const tokenId = arg("tokenId");
  const endpoint = hasArg("endpointFile") ? argFile("endpointFile") : arg("endpoint");
  const message = hasArg("messageFile") ? argFile("messageFile") : arg("message");
  const rpc = process.argv.includes("--rpc")
    ? arg("rpc")
    : "https://bsc-dataseed.binance.org";
  if (!ethers.isAddress(from) || !ethers.isAddress(to)) {
    throw new Error("from/to must be valid addresses");
  }
  // The contract limits are in BYTES (bytes(endpoint).length <= 200,
  // bytes(message).length <= 280). String .length counts UTF-16 code
  // units, so an emoji message can pass a .length check and still
  // revert on-chain with a confusing dry-run error. Measure bytes.
  const endpointBytes = Buffer.byteLength(endpoint, "utf8");
  const messageBytes = Buffer.byteLength(message, "utf8");
  if (endpointBytes > 200)
    throw new Error(
      `endpoint is ${endpointBytes} bytes, over the 200-byte contract limit — shorten it (an emoji counts as 4 bytes)`
    );
  if (messageBytes > 280)
    throw new Error(
      `message is ${messageBytes} bytes, over the 280-byte contract limit — shorten it (an emoji counts as 4 bytes)`
    );
  // The directory only links https:// endpoints. Refuse anything else
  // here, before the holder signs — a javascript:/http: endpoint would
  // be stored forever and shown as plain text at best, a phishing
  // vector at worst.
  if (!endpoint.startsWith("https://")) {
    throw new Error("endpoint must start with https://");
  }

  const provider = new ethers.JsonRpcProvider(rpc);
  const card = new ethers.Contract(to, ABI, provider);
  const agentId = new ethers.Contract(AGENT_ID, AGENT_ID_ABI, provider);

  // The deployed card must point at the OFFICIAL Agent ID contract.
  // A card deployed with any other address is a different, wrong
  // deployment — stop before the holder signs anything to it.
  const cardAgentId = await card.agentId();
  if (cardAgentId.toLowerCase() !== AGENT_ID.toLowerCase()) {
    throw new Error(
      `AgentCard.agentId() is ${cardAgentId}, expected official Agent ID ${AGENT_ID}. Wrong deployment — do NOT register here.`
    );
  }
  console.log("AgentCard.agentId() OK (official Agent ID):", cardAgentId);

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
  console.log("4. Check the receipt, then verify the card on-chain:");
  console.log(`   endpointOf(${from}) and getCard(${from}) on the AgentCard contract,`);
  console.log("   plus the BscScan transaction link. The directory on the");
  console.log("   AgentCard site (read-only) will list the card once indexed.");
}

main().catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});
