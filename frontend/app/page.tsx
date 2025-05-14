'use client';

import Link from 'next/link'
import React from 'react'
import './home.css'
import { useWallet } from '../src/utils/ethersWallet'

function ConnectWalletButton() {
  const { connect, disconnect, isConnected, address } = useWallet()

  const handleConnect = async () => {
    try {
      if (isConnected) {
        await disconnect()
      } else {
        await connect()
      }
    } catch (error) {
      console.error('Wallet connection error:', error)
    }
  }

  return (
    <div className="wallet-button-container">
      <button 
        className="connect-wallet-btn"
        onClick={handleConnect}
      >
        {isConnected && address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connect Wallet'}
      </button>
    </div>
  )
}

export default function Home() {
  return (
    <div className="home-container">
      <header className="main-header">
        <div className="header-content">
          <div className="header-left">
            <h1>EggCoin DApp</h1>
            <p>Sustainable agriculture investment platform</p>
          </div>
          <ConnectWalletButton />
        </div>
      </header>

      <main className="main-content">
        <div className="dashboard-selector">
          <h2>Select Your Dashboard</h2>
          <div className="dashboard-grid">
            <Link href="/farmer" className="dashboard-card farmer-card">
              <div className="card-content">
                <div className="card-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3>Farmer Dashboard</h3>
                <p>Manage farm operations, request loans, and track production</p>
              </div>
            </Link>

            <Link href="/investor" className="dashboard-card investor-card">
              <div className="card-content">
                <div className="card-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3>Investor Dashboard</h3>
                <p>Stake funds, track returns, and manage investments</p>
              </div>
            </Link>

            <Link href="/vendor" className="dashboard-card vendor-card">
              <div className="card-content">
                <div className="card-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3>Vendor Dashboard</h3>
                <p>Manage inventory, process orders, and track shipments</p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
