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
    },
    8453: { // baseMainnet
      address: process.env.NEXT_PUBLIC_EGGCOIN_ADDRESS || '0xCd22e18D0605a6843Fd74F11D02b7622D5Dfe251'
    }
  },
  MockUSDC: {
    31337: {
      address: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
    },
    84532: {
      address: process.env.NEXT_PUBLIC_MOCKUSDC_ADDRESS || ''
    },
    8453: { // baseMainnet
      address: process.env.NEXT_PUBLIC_MOCKUSDC_ADDRESS || '0x76CBb757d25ee75876B894079463D5973e9d593B'
    }
  },
  StakingPool: {
    31337: {
      address: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'
    },
    84532: {
      address: process.env.NEXT_PUBLIC_STAKINGPOOL_ADDRESS || ''
    },
    8453: { // baseMainnet
      address: process.env.NEXT_PUBLIC_STAKINGPOOL_ADDRESS || '0x3FcB35a1CbFB6007f9BC638D388958Bc4550cB28'
    }
  },
  LiquidityPool: {
    31337: {
      address: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9'
    },
    84532: {
      address: process.env.NEXT_PUBLIC_LIQUIDITYPOOL_ADDRESS || ''
    },
    8453: { // baseMainnet
      address: process.env.NEXT_PUBLIC_LIQUIDITYPOOL_ADDRESS || '0x1A7879934f5106Cef3FDc0eF432A565911f10378'
    }
  },
  LoanManager: {
    31337: {
      address: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9'
    },
    84532: {
      address: process.env.NEXT_PUBLIC_LOANMANAGER_ADDRESS || ''
    },
    8453: { // baseMainnet
      address: process.env.NEXT_PUBLIC_LOANMANAGER_ADDRESS || '0x653bb152d1B3fF6641f5f50F021686CCf1D8F80e'
    }
  },
  YieldPool: {
    31337: {
      address: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707'
    },
    84532: {
      address: process.env.NEXT_PUBLIC_YIELDPOOL_ADDRESS || ''
    },
    8453: { // baseMainnet
      address: process.env.NEXT_PUBLIC_YIELDPOOL_ADDRESS || '0xB0b0768B68189aF86d93C150881002a21b35dB20'
    }
  }
};
