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
    // BscScan verification. Leave BSCSCAN_API_KEY empty to use Sourcify only.
    apiKey: {
      bscTestnet: process.env.BSCSCAN_API_KEY || "",
      bsc: process.env.BSCSCAN_API_KEY || "",
    },
  },
  sourcify: {
    enabled: true,
  },
};
