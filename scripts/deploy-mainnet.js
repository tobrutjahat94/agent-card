// ============================================================
// MAINNET DEPLOY — RUN ONLY BY THE HUMAN WALLET OWNER, DIRECTLY.
// This script is NEVER run by the bot, and no approval given in
// chat authorizes it. The wallet owner runs it themselves from
// their own dedicated deployer wallet (new wallet, gas-only BNB,
// key never shared — see README "Deploy preparation").
// Deploys AgentCard (BNB Chain, chainId 56) with the OFFICIAL
// Agent ID contract — no mock. Requires MAINNET_PRIVATE_KEY env
// (the deployer pays real BNB gas). Writes addresses to
// deployments/bscMainnet.json. After deploy: verify on BscScan
// IMMEDIATELY (eligibility requirement), then the holder test
// (see docs/AGENT-GUIDE.md).
// ============================================================
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// Official SPACE ID Agent ID contract on BNB Chain (from the Binance announcement).
const AGENT_ID_MAINNET = "0x60b9262456de011f7d15a54cdd8c48baaa8b022f";

async function main() {
  if (!process.env.MAINNET_PRIVATE_KEY) {
    throw new Error(
      "MAINNET_PRIVATE_KEY env is required. Aborting — nothing was deployed."
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
  console.log("Next: verify on BscScan, then submit the project (see SUBMISSION.md).");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
