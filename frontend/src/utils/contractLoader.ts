import { ethers } from 'ethers';
import { CONTRACTS } from '../config/wallet';
import { useWallet } from './ethersWallet';

// Path to backend artifacts
const ARTIFACTS_PATH = '../../backend/artifacts/contracts';

export interface ContractConfig {
  address: string;
  abi: any[];
}

async function loadArtifact(contractName: string) {
  try {
    // Construct path to artifact JSON
    const artifactPath = `${ARTIFACTS_PATH}/${contractName}.sol/${contractName}.json`;
    const response = await fetch(artifactPath);
    if (!response.ok) throw new Error('Failed to fetch artifact');
    return await response.json();
  } catch (error) {
    console.error(`Error loading ${contractName} artifact:`, error);
    throw error;
  }
}

export async function loadContract(
  contractName: keyof typeof CONTRACTS,
  provider: ethers.BrowserProvider | null,
  signer: ethers.JsonRpcSigner | null
): Promise<ContractConfig> {
  if (!provider || !signer) {
    throw new Error('Wallet not connected');
  }

  const network = await provider.getNetwork();
  const chainId = Number(network.chainId);

  const contractConfig = CONTRACTS[contractName][chainId];
  if (!contractConfig) {
    throw new Error(`No config found for ${contractName} on chain ${chainId}`);
  }

  try {
    // Load artifact and extract ABI
    const artifact = await loadArtifact(contractName);
    const abi = artifact.abi;

    return {
      address: contractConfig.address,
      abi
    };
  } catch (error) {
    console.error(`Error loading contract ${contractName}:`, error);
    throw error;
  }
}

export async function getContractInstance(
  contractName: keyof typeof CONTRACTS,
  signer: ethers.JsonRpcSigner | null
) {
  if (!signer) throw new Error('Wallet not connected');

  const { address, abi } = await loadContract(
    contractName, 
    signer.provider as ethers.BrowserProvider,
    signer
  );
  
  // Create ethers Contract instance
  const contract = new ethers.Contract(address, abi, signer);
  
  console.log(`Created contract instance for ${contractName} at ${address}`);
  return contract;
}

// Utility function to get contract instance by name and address
export async function getCustomContractInstance(
  contractName: string,
  contractAddress: string,
  signer: ethers.JsonRpcSigner | null
) {
  if (!signer) throw new Error('Wallet not connected');

  const artifact = await loadArtifact(contractName);
  return new ethers.Contract(contractAddress, artifact.abi, signer);
}
