'use client';
import React, { useState } from 'react';
import './dashboard.css';

const FarmerDashboard = () => {
  const [loanAmount, setLoanAmount] = useState('');
  const [productionCount, setProductionCount] = useState('');

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
              <button className="btn btn-primary">Submit Request</button>
            </div>
          </div>
          
          {/* Loan Status */}
          <div className="card">
            <h4>Current Loan</h4>
            <div className="info-group">
              <div className="info-row">
                <span>Amount:</span>
                <span>0 USDC</span>
              </div>
              <div className="info-row">
                <span>Status:</span>
                <span>No active loan</span>
              </div>
              <div className="info-row">
                <span>Due Date:</span>
                <span>-</span>
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
                  placeholder="0"
                  min="0"
                  disabled
                />
              </div>
              <button className="btn" disabled>Repay Loan</button>
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
