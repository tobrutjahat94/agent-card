require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      accounts:
        process.env.TESTNET_PRIVATE_KEY && process.env.TESTNET_PRIVATE_KEY.length > 0
          ? [process.env.TESTNET_PRIVATE_KEY]
          : [],
    },
    bsc: {
      url: "https://bsc-dataseed.binance.org",
      chainId: 56,
      accounts:
        process.env.MAINNET_PRIVATE_KEY && process.env.MAINNET_PRIVATE_KEY.length > 0
          ? [process.env.MAINNET_PRIVATE_KEY]
          : [],
    },
  },
  etherscan: {
    // BscScan verification. BSCSCAN_API_KEY is REQUIRED for the
    // contract page on BscScan to show "Source Code Verified" — that
    // is the hackathon eligibility requirement. Sourcify alone is NOT
    // enough. Get a free key from your BscScan account and set it via
    // env (never commit it): BSCSCAN_API_KEY=<key> — same safe
    // handling as the deployer key (hidden prompt or git-ignored
    // .env file, never on a command line).
    apiKey: {
      bscTestnet: process.env.BSCSCAN_API_KEY || "",
      bsc: process.env.BSCSCAN_API_KEY || "",
    },
  },
  sourcify: {
    // Supplemental only. Sourcify verification does NOT satisfy the
    // BscScan "Source Code Verified" requirement.
    enabled: true,
  },
};
