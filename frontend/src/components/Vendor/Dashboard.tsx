'use client';
import React, { useState } from 'react';
import './dashboard.css';

const VendorDashboard = () => {
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [exchangeAmount, setExchangeAmount] = useState<string>('');

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setPaymentAmount(value);
    }
  };

  const handleExchangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setExchangeAmount(value);
    }
  };

  const handleProcessPayment = () => {
    if (paymentAmount && !isNaN(Number(paymentAmount))) {
      const amount = Number(paymentAmount);
      // Process payment logic here
      console.log('Processing payment:', amount);
    }
  };

  const handleExchange = () => {
    if (exchangeAmount && !isNaN(Number(exchangeAmount))) {
      const amount = Number(exchangeAmount);
      // Exchange logic here
      console.log('Exchanging:', amount);
    }
  };

  return (
    <div className="container">
      <div className="dashboard-header">
        <h2>Vendor Dashboard</h2>
        <p>Manage payments and exchange operations</p>
      </div>
      
      {/* Payment Processing */}
      <div className="card">
        <h3>Payment Processing</h3>
        <div className="grid-container">
          {/* Payment Form */}
          <div className="card payment-card">
            <h4>Accept Payment</h4>
            <div className="form-group">
              <div>
                <label htmlFor="paymentAmount">Amount (EggCoin)</label>
                <input
                  type="number"
                  id="paymentAmount"
                  placeholder="0"
                  min="0"
                  value={paymentAmount}
                  onChange={handlePaymentChange}
                />
              </div>
              <button 
                className="btn btn-primary"
                onClick={handleProcessPayment}
                disabled={!paymentAmount || isNaN(Number(paymentAmount))}
              >
                Process Payment
              </button>
            </div>
          </div>
          
          {/* Balance Display */}
          <div className="card balance-card">
            <h4>Current Balances</h4>
            <div className="info-group">
              <div className="info-row">
                <span>EggCoin:</span>
                <span>0 EGC</span>
              </div>
              <div className="info-row">
                <span>USDC:</span>
                <span>0 USDC</span>
              </div>
              <div className="info-row">
                <span>Total Value:</span>
                <span>$0.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exchange Options */}
      <div className="card">
        <h3>Exchange Options</h3>
        <div className="exchange-container">
          <div className="card exchange-card">
            <h4>Exchange EggCoin to USDC</h4>
            <div className="form-group">
              <div>
                <label htmlFor="exchangeAmount">Amount (EggCoin)</label>
                <input
                  type="number"
                  id="exchangeAmount"
                  placeholder="0"
                  min="0"
                  value={exchangeAmount}
                  onChange={handleExchangeChange}
                />
              </div>
              <div className="rate-info">
                Current rate: 1 EGC = 1.05 USDC
              </div>
              <button 
                className="btn btn-secondary"
                onClick={handleExchange}
                disabled={!exchangeAmount || isNaN(Number(exchangeAmount))}
              >
                Exchange Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="card">
        <h3>Transaction History</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} className="empty-message">
                  No transactions yet
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
