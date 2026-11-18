// Deploy AgentCard to BSC TESTNET (chainId 97) for end-to-end proof.
// Uses MockAgentID because the official Agent ID contract does not exist
// on testnet. Mints one mock Agent ID to the deployer and registers a test
// card, so the deployment is proven working on-chain.
// Requires TESTNET_PRIVATE_KEY env (throwaway testnet-only wallet).
// Writes addresses to deployments/bscTestnet.json (public info, safe to commit).
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log(
    "Balance:",
    hre.ethers.formatEther(
      await hre.ethers.provider.getBalance(deployer.address)
    ),
    "tBNB"
  );

  const Mock = await hre.ethers.getContractFactory("MockAgentID");
  const mock = await Mock.deploy();
  await mock.waitForDeployment();
  const mockAddress = await mock.getAddress();
  console.log("MockAgentID deployed:", mockAddress);

  const Card = await hre.ethers.getContractFactory("AgentCard");
  const card = await Card.deploy(mockAddress);
  await card.waitForDeployment();
  const cardAddress = await card.getAddress();
  console.log("AgentCard deployed:", cardAddress);

  const mintTx = await mock.mint(deployer.address);
  const mintReceipt = await mintTx.wait();
  // First mint is tokenId 1.
  console.log("Mock Agent ID minted to deployer (tokenId 1), tx:", mintReceipt.hash);

  const regTx = await card.register(
    1,
    "https://agentcard.example/agents/deployer",
    "AgentCard testnet demo card"
  );
  const regReceipt = await regTx.wait();
  console.log("Test register tx:", regReceipt.hash, "| block:", regReceipt.blockNumber);
  const c = await card.getCard(deployer.address);
  console.log(
    "Card after test register: tokenId=%s endpoint=%s message=%s",
    c.tokenId,
    c.endpoint,
    c.message
  );

  const out = {
    network: "bscTestnet",
    chainId: 97,
    agentIdContract: mockAddress,
    agentIdNote:
      "MockAgentID (TESTNET ONLY — official Agent ID lives on mainnet only)",
    agentCard: cardAddress,
    deployer: deployer.address,
    testMintTx: mintReceipt.hash,
    testRegisterTx: regReceipt.hash,
    deployedAt: new Date().toISOString(),
  };
  const dir = path.join(__dirname, "..", "deployments");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, "bscTestnet.json"),
    JSON.stringify(out, null, 2) + "\n"
  );
  console.log("Wrote deployments/bscTestnet.json");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
