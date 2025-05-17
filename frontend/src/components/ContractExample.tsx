'use client';

import { useState } from 'react';
import { useWallet } from '../utils/viemWallet';
import { publicClient } from '../config/wallet';
import { CONTRACTS } from '../config/wallet';
import { getContractInstance } from '../utils/contractLoader';

export default function ContractExample() {
  const { address, isConnected, contracts } = useWallet();
  const [balance, setBalance] = useState<string>('0');
  const [amount, setAmount] = useState<string>('10');

  const fetchBalance = async () => {
    if (!isConnected || !contracts?.EggCoin) return;
    
    try {
      const eggCoin = await getContractInstance('EggCoin', contracts.EggCoin.signer);
      const balance = await eggCoin.balanceOf(address);
      setBalance(balance.toString());
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  };

  const transferTokens = async () => {
    if (!isConnected || !contracts?.EggCoin) return;
    
    try {
      const eggCoin = await getContractInstance('EggCoin', contracts.EggCoin.signer);
      const tx = await eggCoin.transfer(
        '0x0000000000000000000000000000000000000000', // Replace with recipient
        BigInt(amount)
      );
      
      const receipt = await tx.wait();
      console.log('Transfer complete:', receipt);
      await fetchBalance(); // Refresh balance
    } catch (error) {
      console.error('Transfer failed:', error);
    }
  };

  return (
    <div className="contract-example">
      <h3>EggCoin Contract Example</h3>
      
      <div>
        <button onClick={fetchBalance}>Get Balance</button>
        <p>Balance: {balance}</p>
      </div>

      <div>
        <input 
          type="number" 
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button onClick={transferTokens}>Transfer</button>
      </div>
    </div>
  );
}
