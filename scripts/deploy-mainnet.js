// ============================================================
// MAINNET DEPLOY — RUN ONLY BY THE HUMAN WALLET OWNER, DIRECTLY.
// This script is NEVER run by the bot, and no approval given in
// chat authorizes it. The wallet owner runs it themselves from
// their own dedicated deployer wallet (new wallet, gas-only BNB,
// key never shared — see README "Deploy preparation").
// Deploys AgentCard (BNB Chain, chainId 56) with the OFFICIAL
// Agent ID contract — no mock.
//
// KEY HANDLING — READ THIS FIRST:
// Never put the private key on a command line (KEY=... command),
// because it lands in shell history. Use ONE of these instead:
//   (a) .env file (git-ignored, never committed): write
//       MAINNET_PRIVATE_KEY=<key> into a file named .env in the
//       repo root with your editor, then run:
//         set -a; source .env; set +a
//         npx hardhat run scripts/deploy-mainnet.js --network bsc
//       Delete the .env file when you are done.
//   (b) Hidden prompt (nothing echoed, nothing in history):
//         read -s -p "Paste deployer private key (hidden): " MAINNET_PRIVATE_KEY
//         echo
//         npx hardhat run scripts/deploy-mainnet.js --network bsc
// After the deploy, run `unset MAINNET_PRIVATE_KEY` and
// `history -c` (then close the shell) so the key leaves memory
// and history. The key must NEVER appear in chat, in the repo,
// or in any state file.
// Requires MAINNET_PRIVATE_KEY env (the deployer pays real BNB
// gas). Writes addresses to deployments/bscMainnet.json. After
// deploy: verify on BscScan IMMEDIATELY (eligibility
// requirement — the contract page must show "Source Code
// Verified"), then the holder test (see docs/AGENT-GUIDE.md).
// ============================================================
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// Official SPACE ID Agent ID contract on BNB Chain (from the Binance announcement).
const AGENT_ID_MAINNET = "0x60b9262456de011f7d15a54cdd8c48baaa8b022f";

async function main() {
  if (!process.env.MAINNET_PRIVATE_KEY) {
    throw new Error(
      "MAINNET_PRIVATE_KEY env is required. Aborting — nothing was deployed.\n" +
        "Set it WITHOUT putting it on a command line: either a git-ignored .env file\n" +
        "(set -a; source .env; set +a) or a hidden prompt\n" +
        '(read -s -p "Paste deployer private key (hidden): " MAINNET_PRIVATE_KEY).\n' +
        "See README 'Deploy preparation' and the header of this script."
    );
  }
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log(
    "Balance:",
    hre.ethers.formatEther(
      await hre.ethers.provider.getBalance(deployer.address)
    ),
    "BNB"
  );
  console.log("Agent ID (official):", AGENT_ID_MAINNET);

  const Card = await hre.ethers.getContractFactory("AgentCard");
  const card = await Card.deploy(AGENT_ID_MAINNET);
  await card.waitForDeployment();
  const cardAddress = await card.getAddress();
  console.log("AgentCard deployed:", cardAddress);

  // Post-deploy check — the deployed card MUST point at the official
  // Agent ID contract. If this is not exact, STOP: do not verify,
  // do not invite holders, do not submit. Redeploy with the right
  // constructor argument instead.
  const onChainAgentId = await card.agentId();
  console.log("AgentCard.agentId() on-chain:", onChainAgentId);
  if (onChainAgentId.toLowerCase() !== AGENT_ID_MAINNET.toLowerCase()) {
    throw new Error(
      `agentId() mismatch: on-chain ${onChainAgentId}, expected ${AGENT_ID_MAINNET}. ` +
        "Wrong constructor argument — do NOT proceed."
    );
  }
  console.log("agentId() check PASSED — exactly the official Agent ID contract.");

  const out = {
    network: "bsc",
    chainId: 56,
    agentIdContract: AGENT_ID_MAINNET,
    agentIdNote:
      "Official SPACE ID Agent ID contract (ERC-721, non-transferable)",
    agentCard: cardAddress,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
  };
  const dir = path.join(__dirname, "..", "deployments");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, "bscMainnet.json"),
    JSON.stringify(out, null, 2) + "\n"
  );
  console.log("Wrote deployments/bscMainnet.json");
  console.log(
    "Next: (1) verify source on BscScan NOW — the contract page must show " +
      '"Source Code Verified" (Sourcify alone is NOT enough; see README). ' +
      "(2) Then the holder test (docs/AGENT-GUIDE.md). " +
      "(3) Only after verification, invite other holders."
  );
  console.log(
    "Finally: unset MAINNET_PRIVATE_KEY and clear shell history " +
      "(`unset MAINNET_PRIVATE_KEY; history -c`), and delete any .env file you used."
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
