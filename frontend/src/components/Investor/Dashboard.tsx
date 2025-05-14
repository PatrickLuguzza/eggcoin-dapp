'use client';

import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../../utils/ethersWallet';
import { getContract } from '../../utils/contract';
import './dashboard.css';

const InvestorDashboard = () => {
  const [usdcBalance, setUsdcBalance] = useState<string>('0');
  const [stakeAmount, setStakeAmount] = useState<string>('');
  const [unstakeAmount, setUnstakeAmount] = useState<string>('');
  const [isStaking, setIsStaking] = useState<boolean>(false);
  const [isUnstaking, setIsUnstaking] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const { connect, disconnect, isConnected, address, provider, signer } = useWallet();

  const handleStake = async () => {
    if (!stakeAmount || !signer || !address) return;
    
    setIsStaking(true);
    try {
      const mockUsdc = await getContract('MockUSDC', signer);
      const stakingPool = await getContract('StakingPool', signer);
      
      // First check if user has enough balance
      const initialBalance = await mockUsdc.balanceOf(address);
      if (initialBalance < ethers.parseUnits(stakeAmount, 6)) {
        alert(`Insufficient MockUSDC balance. Use faucet to get test tokens.`);
        return;
      }
        
        // Approve USDC spending
        const approveTx = await mockUsdc.approve(
          stakingPool.address,
          ethers.parseUnits(stakeAmount, 6)
        );
        await approveTx.wait();

        // Stake USDC
        const stakeTx = await stakingPool.stake(
          ethers.parseUnits(stakeAmount, 6)
        );
        await stakeTx.wait();

        // Show success notification
        alert(`Successfully staked ${stakeAmount} USDC`);

        // Refresh balances
        const updatedBalance = await mockUsdc.balanceOf(address);
        setUsdcBalance(updatedBalance.toString());
        setStakeAmount('');
    } catch (error) {
      console.error('Staking error:', error);
    } finally {
      setIsStaking(false);
    }
  };

  const handleUnstake = async () => {
    if (!unstakeAmount || !signer) return;
    
    try {
      setIsUnstaking(true);
      const stakingPool = await getContract('StakingPool', signer);
      
      // Unstake USDC
      const unstakeTx = await stakingPool.unstake(
        ethers.parseUnits(unstakeAmount, 6)
      );
      await unstakeTx.wait();

      // Refresh balances
      const mockUsdc = await getContract('MockUSDC', signer);
      const balance = await mockUsdc.balanceOf(address);
      setUsdcBalance(balance.toString());
      setUnstakeAmount('');
    } catch (error) {
      console.error('Unstaking error:', error);
    } finally {
      setIsUnstaking(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        if (!isConnected) {
          await connect();
        }

        if (address && signer) {
          const mockUsdc = await getContract('MockUSDC', signer);
          const balance = await mockUsdc.balanceOf(address);
          setUsdcBalance(balance.toString());
        }
      } catch (error) {
        console.error('Error initializing:', error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [isConnected, address, signer]);

  return (
    <div className="container">
      <div className="dashboard-header">
        <h2>Investor Dashboard</h2>
      </div>
      
      <div className="card">
        <h3>Portfolio Overview</h3>
        <div className="grid-container">
          <div className="card balance-card">
            <h4>USDC Balance</h4>
            {loading ? (
              <p className="loading">Loading...</p>
            ) : (
              <p className="balance-amount">{usdcBalance} USDC</p>
            )}
          </div>
          
          <div className="card placeholder">
            <p>Current yield earnings will go here</p>
          </div>
          
          <div className="card placeholder">
            <p>Estimated APY will go here</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Stake Management</h3>
        <div className="grid-container">
          <div className="card">
            <h4>Stake USDC</h4>
            <div className="form-group">
              <div>
                <label htmlFor="stakeAmount">Amount</label>
                <input
                  type="number"
                  id="stakeAmount"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                />
              </div>
              <button 
                className="btn btn-primary"
                onClick={handleStake}
                disabled={!stakeAmount || isStaking}
              >
                {isStaking ? 'Processing...' : 'Stake'}
              </button>
            </div>
          </div>
          
          <div className="card">
            <h4>Unstake USDC</h4>
            <div className="form-group">
              <div>
                <label htmlFor="unstakeAmount">Amount</label>
                <input
                  type="number"
                  id="unstakeAmount"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={unstakeAmount}
                  onChange={(e) => setUnstakeAmount(e.target.value)}
                />
              </div>
              <button 
                className="btn btn-danger"
                onClick={handleUnstake}
                disabled={!unstakeAmount || isUnstaking}
              >
                {isUnstaking ? 'Processing...' : 'Unstake'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Transaction History</h3>
        <div className="placeholder">
          <p>Transaction history table will go here</p>
        </div>
      </div>
    </div>
  );
};

export default InvestorDashboard;
