// Measures gas used by the AgentCard deploy + register flow on the local
// Hardhat network, so the wallet owner knows the mainnet gas budget
// before deploying. Read-only w.r.t. real chains: runs locally only.
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const Mock = await hre.ethers.getContractFactory("MockAgentID");
  const mock = await Mock.deploy();
  const mockReceipt = await mock.deploymentTransaction().wait();
  console.log("MockAgentID deploy gas:", mockReceipt.gasUsed.toString());

  const Card = await hre.ethers.getContractFactory("AgentCard");
  const card = await Card.deploy(await mock.getAddress());
  const cardReceipt = await card.deploymentTransaction().wait();
  console.log("AgentCard deploy gas:", cardReceipt.gasUsed.toString());

  const mintTx = await mock.mint(deployer.address);
  const mintReceipt = await mintTx.wait();
  console.log("mock mint gas:", mintReceipt.gasUsed.toString());

  const regTx = await card.register(
    1,
    "https://agent.example/alice",
    "Alice's helper agent"
  );
  const regReceipt = await regTx.wait();
  console.log("register gas:", regReceipt.gasUsed.toString());

  const deployGas = Number(cardReceipt.gasUsed);
  const regGas = Number(regReceipt.gasUsed);
  for (const gwei of [1, 3, 5]) {
    const deployCost = (deployGas * gwei) / 1e9;
    const regCost = (regGas * gwei) / 1e9;
    console.log(
      `at ${gwei} gwei: deploy ~${deployCost.toFixed(5)} BNB, register ~${regCost.toFixed(5)} BNB`
    );
  }
  console.log(
    "Suggested deployer wallet funding: 0.02 BNB (covers deploy + verification + several test registers with wide margin)."
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
