'use client';

import { ethers } from 'ethers';
import { createContext, useContext, useState } from 'react';

type Role = 'investor' | 'farmer' | 'vendor' | null;

const RoleContext = createContext<{
  role: Role;
  setRole: (role: Role) => void;
}>({
  role: null,
  setRole: () => {},
});

export function useRole() {
  return useContext(RoleContext);
}

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>(null);

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

import { useWallet } from './utils/ethersWallet';

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const wallet = useWallet();

  return (
    <div>
      {!wallet.isConnected && (
        <button onClick={wallet.connect} className="connect-wallet">
          Connect Wallet
        </button>
      )}
      {wallet.isConnected && (
        <div className="wallet-info">
          <span>{wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}</span>
          <button onClick={wallet.disconnect} className="disconnect-wallet">
            Disconnect
          </button>
        </div>
      )}
      {children}
    </div>
  );
}
