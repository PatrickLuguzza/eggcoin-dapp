import { ethers } from 'ethers';
import axios from 'axios';

const BASE_SCAN_API_URL = 'https://api.basescan.org/api';
const API_KEY = process.env.NEXT_PUBLIC_BASESCAN_API_KEY || 'YourApiKeyToken';

const contractAddresses = {
  baseMainnet: {
    EggCoin: process.env.NEXT_PUBLIC_EGGCOIN_ADDRESS || '0xCd22e18D0605a6843Fd74F11D02b7622D5Dfe251',
    MockUSDC: process.env.NEXT_PUBLIC_MOCKUSDC_ADDRESS || '0x76CBb757d25ee75876B894079463D5973e9d593B',
    StakingPool: process.env.NEXT_PUBLIC_STAKINGPOOL_ADDRESS || '0x3FcB35a1CbFB6007f9BC638D388958Bc4550cB28',
    LiquidityPool: process.env.NEXT_PUBLIC_LIQUIDITYPOOL_ADDRESS || '0x1A7879934f5106Cef3FDc0eF432A565911f10378',
    LoanManager: process.env.NEXT_PUBLIC_LOANMANAGER_ADDRESS || '0x653bb152d1B3fF6641f5f50F021686CCf1D8F80e',
    YieldPool: process.env.NEXT_PUBLIC_YIELDPOOL_ADDRESS || '0xB0b0768B68189aF86d93C150881002a21b35dB20'
  }
};

async function fetchABI(contractAddress) {
  try {
    const response = await axios.get(BASE_SCAN_API_URL, {
      params: {
        module: 'contract',
        action: 'getabi',
        address: contractAddress,
        apikey: API_KEY
      }
    });

    if (response.data.status === '1') {
      return JSON.parse(response.data.result);
    }
    throw new Error(response.data.result || 'Failed to fetch ABI');
  } catch (error) {
    console.error('Error fetching ABI:', error);
    throw error;
  }
}

export async function getContractInfo(contractName) {
  const network = 'baseMainnet';
  try {
    const networkConfig = contractAddresses[network];
    if (!networkConfig) {
      throw new Error(`Network ${network} not configured`);
    }
    
    const address = networkConfig[contractName];
    if (!address) {
      throw new Error(`Contract ${contractName} not found on ${network}`);
    }

    const abi = await fetchABI(address);

    return {
      abi,
      address,
      contract: (providerOrSigner) => {
        return new ethers.Contract(address, abi, providerOrSigner);
      }
    };
  } catch (error) {
    console.error(`Error getting contract info for ${contractName}:`, error);
    throw error;
  }
}
