import { ethers } from 'ethers';

export interface WalletState {
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  address: string | null;
  chainId: bigint | null;
  contracts: Record<string, ethers.Contract> | null;
}

export declare function connectWallet(): Promise<WalletState>;
export declare function disconnectWallet(): void;

export declare function useWallet(): {
  connect: () => Promise<WalletState>;
  disconnect: () => void;
  isConnected: boolean;
  address: string | null | undefined;
  provider: ethers.BrowserProvider | null | undefined;
  signer: ethers.JsonRpcSigner | null | undefined;
  contracts: Record<string, ethers.Contract> | null | undefined;
};
