'use client';

import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import { CONTRACTS } from '../config/wallet';
import { EggCoinABI } from '../contracts/EggCoinABI';

const ABIS = {
  EggCoin: EggCoinABI
};

export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error('No Ethereum provider found');
  }

  try {
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const network = await provider.getNetwork();

    const contracts = Object.fromEntries(
      Object.entries(CONTRACTS).map(([name, config]) => {
        const chainId = Number(network.chainId);
        return [
          name,
          new ethers.Contract(
            config[chainId].address,
            ABIS[name as keyof typeof ABIS] || [],
            signer
          )
        ];
      })
    );

    return {
      provider,
      signer,
      address,
      chainId: network.chainId,
      contracts
    };
  } catch (error) {
    console.error('Wallet connection error:', error);
    throw error;
  }
};

export const useWallet = () => {
  const [wallet, setWallet] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setWallet(null);
        setIsConnected(false);
      } else if (wallet?.address !== accounts[0]) {
        connectWallet().then(setWallet).catch(setError);
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [wallet?.address]);

  const connect = async () => {
    try {
      setError(null);
      const walletData = await connectWallet();
      setWallet(walletData);
      setIsConnected(true);
      return walletData;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Connection failed';
      setError(message);
      throw error;
    }
  };

  const disconnect = () => {
    setWallet(null);
    setIsConnected(false);
    setError(null);
  };

  return {
    connect,
    disconnect,
    isConnected,
    address: wallet?.address,
    contracts: wallet?.contracts,
    error,
    resetError: () => setError(null)
  };
};
