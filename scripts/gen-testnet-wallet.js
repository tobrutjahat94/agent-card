// Generates a FRESH, THROWAWAY, TESTNET-ONLY deployer wallet for AgentStreak.
// The key is stored in deployments/testnet-deployer.json (chmod 600) and is
// git-ignored. NEVER send real funds to this address; NEVER use this key on
// mainnet. The user never needs this key — it exists only so the testnet
// deploy can be signed without touching any of the user's real wallets.
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

const wallet = ethers.Wallet.createRandom();
const out = {
  address: wallet.address,
  privateKey: wallet.privateKey,
  mnemonic: wallet.mnemonic ? wallet.mnemonic.phrase : null,
  purpose: "THROWAWAY TESTNET-ONLY deployer for AgentStreak (BSC testnet, chainId 97). No real funds. Never use on mainnet.",
  createdAt: new Date().toISOString(),
};
const dir = path.join(__dirname, "..", "deployments");
fs.mkdirSync(dir, { recursive: true });
const file = path.join(dir, "testnet-deployer.json");
fs.writeFileSync(file, JSON.stringify(out, null, 2) + "\n", { mode: 0o600 });
fs.chmodSync(file, 0o600);
console.log("Address (fund this with testnet faucet tBNB):", wallet.address);
console.log("Saved key to deployments/testnet-deployer.json (600, git-ignored)");
