'use client';

import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import { CONTRACTS } from '../config/wallet';

interface WalletState {
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  address: string | null;
  chainId: bigint | null;
  contracts: Record<string, ethers.Contract> | null;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error('No Ethereum provider found');
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // Handle concurrent request error
    let signer;
    try {
      signer = await provider.getSigner();
    } catch (error: any) {
      if (error.code === -32002) {
        // Wait briefly and retry if wallet is busy
        await new Promise(resolve => setTimeout(resolve, 1000));
        signer = await provider.getSigner();
      } else {
        throw error;
      }
    }

    const address = await signer.getAddress();
    const network = await provider.getNetwork();

    return {
      provider,
      signer,
      address,
      chainId: network.chainId,
      contracts: Object.fromEntries(
        Object.entries(CONTRACTS).map(([name, config]) => {
          const chainIdNum = Number(network.chainId);
          return [
            name,
            new ethers.Contract(config[chainIdNum].address, [], signer)
          ];
        })
      )
    };
  } catch (error) {
    console.error('Wallet connection error:', error);
    throw error;
  }
};

export const disconnectWallet = () => {
  // Ethers.js doesn't have built-in disconnect, just clear any stored state
  return {
    provider: null,
    signer: null,
    address: null,
    chainId: null,
    contracts: null
  };
};

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = async () => {
    try {
      const walletData = await connectWallet();
      setWallet(walletData);
      setIsConnected(true);
      return walletData;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  };

  const disconnect = () => {
    disconnectWallet();
    setWallet(null);
    setIsConnected(false);
  };

  return {
    connect,
    disconnect,
    isConnected,
    address: wallet?.address,
    provider: wallet?.provider,
    signer: wallet?.signer,
    contracts: wallet?.contracts
  };
};
