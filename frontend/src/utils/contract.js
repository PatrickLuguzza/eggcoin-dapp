import { ethers } from 'ethers';
import { getContractInfo } from './contractInfo';

export async function getContract(contractName, providerOrSigner, network = 'localhost') {
  try {
    const { abi, address } = await getContractInfo(contractName, network);
    return new ethers.Contract(address, abi, providerOrSigner);
  } catch (error) {
    console.error(`Error creating contract instance for ${contractName}:`, error);
    throw error;
  }
}

// Example usage:
// const provider = new ethers.BrowserProvider(window.ethereum);
// const contract = await getContract('EggCoin', provider);
