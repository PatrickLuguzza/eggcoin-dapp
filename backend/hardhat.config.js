require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_RPC_URL,
      chainId: 84532,
      accounts: {
        mnemonic: process.env.MNEMONIC,
      },
    },
    baseMainnet: {
      url: process.env.BASE_MAINNET_RPC_URL,
      chainId: 8453,
      accounts: {
        mnemonic: process.env.MNEMONIC,
      },
    }
  },
  etherscan: {
    apiKey: {
      baseSepolia: process.env.BASESCAN_API_KEY,
      baseMainnet: process.env.BASESCAN_API_KEY,
    },
    customChains: [
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org"
        }
      },
      {
        network: "baseMainnet",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org"
        }
      }
    ]
  },
  paths: {
    artifacts: "./artifacts",
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
  },
};
