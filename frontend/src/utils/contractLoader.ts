import axios from 'axios';
import { ethers } from 'ethers';
import { JsonRpcProvider } from 'ethers/providers';

interface ContractAddresses {
  MockUSDC: string;
  EggCoin: string;
  LiquidityPool: string;
  LoanManager: string;
  YieldPool: string;
}

const CONTRACT_ADDRESSES: ContractAddresses = {
  MockUSDC: process.env.NEXT_PUBLIC_MOCKUSDC_ADDRESS || '0x76CBb757d25ee75876B894079463D5973e9d593B',
  EggCoin: process.env.NEXT_PUBLIC_EGGCOIN_ADDRESS || '0xCd22e18D0605a6843Fd74F11D02b7622D5Dfe251',
  LiquidityPool: process.env.NEXT_PUBLIC_LIQUIDITYPOOL_ADDRESS || '0x1A7879934f5106Cef3FDc0eF432A565911f10378',
  LoanManager: process.env.NEXT_PUBLIC_LOANMANAGER_ADDRESS || '0x653bb152d1B3fF6641f5f50F021686CCf1D8F80e',
  YieldPool: process.env.NEXT_PUBLIC_YIELDPOOL_ADDRESS || '0xB0b0768B68189aF86d93C150881002a21b35dB20'
};

export async function getContractAbi(contractAddress: string): Promise<ethers.InterfaceAbi> {
  try {
    if (!process.env.NEXT_PUBLIC_BASESCAN_API_KEY) {
      throw new Error('BaseScan API key not configured');
    }

    const url = `https://api.basescan.org/api?module=contract&action=getabi&address=${contractAddress}&apikey=${process.env.NEXT_PUBLIC_BASESCAN_API_KEY}`;
    const response = await axios.get<{
      status: string;
      message: string;
      result: string;
    }>(url);
    
    if (response.data.status !== '1') {
      throw new Error(`BaseScan API error: ${response.data.message}`);
    }

    return JSON.parse(response.data.result) as ethers.InterfaceAbi;
  } catch (error) {
    console.error('Error fetching ABI:', error);
    throw error;
  }
}

export async function getContractInstance(
  contractAddress: string,
  signerOrProvider?: ethers.Signer | ethers.Provider
): Promise<ethers.Contract> {
  try {
    const abi = await getContractAbi(contractAddress);
    const provider = signerOrProvider || new JsonRpcProvider(process.env.NEXT_PUBLIC_BASE_RPC_URL);
    return new ethers.Contract(contractAddress, abi, provider);
  } catch (error) {
    console.error('Error creating contract instance:', error);
    throw error;
  }
}

export async function getAllContracts(signer?: ethers.Signer): Promise<Record<keyof ContractAddresses, ethers.Contract>> {
  const contracts = {
    MockUSDC: await getContractInstance(CONTRACT_ADDRESSES.MockUSDC, signer),
    EggCoin: await getContractInstance(CONTRACT_ADDRESSES.EggCoin, signer),
    LiquidityPool: await getContractInstance(CONTRACT_ADDRESSES.LiquidityPool, signer),
    LoanManager: await getContractInstance(CONTRACT_ADDRESSES.LoanManager, signer),
    YieldPool: await getContractInstance(CONTRACT_ADDRESSES.YieldPool, signer)
  };

  return contracts;
}
