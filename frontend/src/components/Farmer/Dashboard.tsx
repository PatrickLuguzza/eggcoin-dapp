'use client';
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import './dashboard.css';

// Contract ABIs will be fetched dynamically
let EggCoinABI: ethers.InterfaceAbi;
let MockUSDCABI: ethers.InterfaceAbi; 
let LiquidityPoolABI: ethers.InterfaceAbi;

const FarmerDashboard = () => {
  const [loanAmount, setLoanAmount] = useState('');
  const [productionCount, setProductionCount] = useState('');
  const [eggBalance, setEggBalance] = useState('0');
  const [usdcBalance, setUsdcBalance] = useState('0');
  interface Loan {
    amount: bigint;
    status: string;
    dueDate: number;
  }
  
  const [currentLoan, setCurrentLoan] = useState<Loan | null>(null);

  useEffect(() => {
    async function loadABIs() {
      try {
        // Fetch ABIs from backend or public folder
        const responses = await Promise.all([
          axios.get('/api/abi/EggCoin'),
          axios.get('/api/abi/MockUSDC'), 
          axios.get('/api/abi/LiquidityPool')
        ]);
        
        EggCoinABI = responses[0].data as ethers.InterfaceAbi;
        MockUSDCABI = responses[1].data as ethers.InterfaceAbi;
        LiquidityPoolABI = responses[2].data as ethers.InterfaceAbi;
        
        // Initialize contract instances
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        
        // Get balances
        const eggCoin = new ethers.Contract(
          process.env.NEXT_PUBLIC_EGGCOIN_ADDRESS!,
          EggCoinABI,
          signer
        );
        setEggBalance(await eggCoin.balanceOf(address));
        
        const mockUSDC = new ethers.Contract(
          process.env.NEXT_PUBLIC_MOCKUSDC_ADDRESS!,
          MockUSDCABI,
          signer
        );
        setUsdcBalance(await mockUSDC.balanceOf(address));
        
        const liquidityPool = new ethers.Contract(
          process.env.NEXT_PUBLIC_LIQUIDITYPOOL_ADDRESS!,
          LiquidityPoolABI,
          signer
        );
        const loan = await liquidityPool.getFarmerLoan(address);
        setCurrentLoan({
          amount: loan.amount,
          status: loan.status,
          dueDate: Number(loan.dueDate)
        });
      } catch (error) {
        console.error('Error loading contract data:', error);
      }
    }
    
    loadABIs();
  }, []);

  return (
    <div className="container">
      {/* Header */}
      <div className="dashboard-header">
        <h2>Farmer Dashboard</h2>
        <p>Manage your farm operations and financing</p>
      </div>
      
      {/* Loan Section */}
      <div className="card">
        <h3>Loan Management</h3>
        <div className="grid-container">
          {/* Loan Request Form */}
          <div className="card">
            <h4>Request Loan</h4>
            <div className="form-group">
              <div>
                <label htmlFor="loanAmount">Amount (USDC)</label>
                <input
                  type="number"
                  id="loanAmount"
                  placeholder="1000"
                  min="0"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                />
              </div>
              <button 
                className="btn btn-primary"
                onClick={async () => {
                  try {
                    const provider = new ethers.BrowserProvider(window.ethereum);
                    const signer = await provider.getSigner();
                    const liquidityPool = new ethers.Contract(
                      process.env.NEXT_PUBLIC_LIQUIDITYPOOL_ADDRESS!,
                      LiquidityPoolABI,
                      signer
                    );
                    
                    const amount = ethers.parseUnits(loanAmount, 6);
                    const tx = await liquidityPool.requestLoan(amount);
                    await tx.wait();
                    
                    // Refresh loan data
                    const loan = await liquidityPool.getFarmerLoan(await signer.getAddress());
                    setCurrentLoan({
                      amount: loan.amount,
                      status: loan.status,
                      dueDate: Number(loan.dueDate)
                    });
                  } catch (error) {
                    console.error('Error requesting loan:', error);
                    alert('Failed to request loan');
                  }
                }}
              >
                Submit Request
              </button>
            </div>
          </div>
          
          {/* Loan Status */}
          <div className="card">
            <h4>Current Loan</h4>
            <div className="info-group">
              <div className="info-row">
                <span>Amount:</span>
                <span>{currentLoan?.amount ? `${ethers.formatUnits(currentLoan.amount, 6)} USDC` : '0 USDC'}</span>
              </div>
              <div className="info-row">
                <span>Status:</span>
                <span>{currentLoan?.status || 'No active loan'}</span>
              </div>
              <div className="info-row">
                <span>Due Date:</span>
                <span>{currentLoan?.dueDate ? new Date(currentLoan.dueDate * 1000).toLocaleDateString() : '-'}</span>
              </div>
            </div>
          </div>
          
          {/* Repayment */}
          <div className="card">
            <h4>Make Payment</h4>
            <div className="form-group">
              <div>
                <label htmlFor="repaymentAmount">Amount (USDC)</label>
                <input
                  type="number"
                  id="repaymentAmount"
                  placeholder={currentLoan?.amount ? ethers.formatUnits(currentLoan.amount, 6) : "0"}
                  min="0"
                  disabled={!currentLoan}
                />
              </div>
              <button 
                className="btn" 
                disabled={!currentLoan}
                onClick={async () => {
                  try {
                    const provider = new ethers.BrowserProvider(window.ethereum);
                    const signer = await provider.getSigner();
                    const liquidityPool = new ethers.Contract(
                      process.env.NEXT_PUBLIC_LIQUIDITYPOOL_ADDRESS!,
                      LiquidityPoolABI,
                      signer
                    );
                    
                    const amount = ethers.parseUnits(loanAmount, 6);
                    const tx = await liquidityPool.repayLoan(amount);
                    await tx.wait();
                    
                    // Refresh loan data
                    const loan = await liquidityPool.getFarmerLoan(await signer.getAddress());
                    setCurrentLoan({
                      amount: loan.amount,
                      status: loan.status,
                      dueDate: Number(loan.dueDate)
                    });
                  } catch (error) {
                    console.error('Error repaying loan:', error);
                    alert('Failed to repay loan');
                  }
                }}
              >
                Repay Loan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Production Log */}
      <div className="card">
        <h3>Egg Production</h3>
        <div className="production-container">
          <div className="card">
            <h4>Daily Production Log</h4>
            <div className="form-group">
              <div>
                <label htmlFor="productionCount">Eggs Collected</label>
                <input
                  type="number"
                  id="productionCount"
                  placeholder="0"
                  min="0"
                  value={productionCount}
                  onChange={(e) => setProductionCount(e.target.value)}
                />
              </div>
              <button className="btn btn-primary">Submit Report</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
