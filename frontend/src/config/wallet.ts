interface ContractConfig {
  address: string;
}

interface ContractMap {
  [key: number]: ContractConfig;
}

export const CONTRACTS: {
  EggCoin: ContractMap;
  MockUSDC: ContractMap;
  StakingPool: ContractMap;
  LiquidityPool: ContractMap;
  LoanManager: ContractMap;
  YieldPool: ContractMap;
} = {
  EggCoin: {
    31337: { // hardhat
      address: '0x5FbDB2315678afecb367f032d93F642f64180aa3'
    },
    84532: { // baseSepolia
      address: process.env.NEXT_PUBLIC_EGGCOIN_ADDRESS || ''
    }
  },
  MockUSDC: {
    31337: {
      address: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
    },
    84532: {
      address: process.env.NEXT_PUBLIC_MOCKUSDC_ADDRESS || ''
    }
  },
  StakingPool: {
    31337: {
      address: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'
    },
    84532: {
      address: process.env.NEXT_PUBLIC_STAKINGPOOL_ADDRESS || ''
    }
  },
  LiquidityPool: {
    31337: {
      address: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9'
    },
    84532: {
      address: process.env.NEXT_PUBLIC_LIQUIDITYPOOL_ADDRESS || ''
    }
  },
  LoanManager: {
    31337: {
      address: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9'
    },
    84532: {
      address: process.env.NEXT_PUBLIC_LOANMANAGER_ADDRESS || ''
    }
  },
  YieldPool: {
    31337: {
      address: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707'
    },
    84532: {
      address: process.env.NEXT_PUBLIC_YIELDPOOL_ADDRESS || ''
    }
  }
};
