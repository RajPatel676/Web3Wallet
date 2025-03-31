import React, { useContext, useState } from "react";
import { WalletContext } from "../context/WalletContext";
import { SimplifiedWalletContext } from "../context/SimplifiedWalletContext";
import { useSecureWallet } from "../context/SecureWalletContext";
import NetworkSelector from "./NetworkSelector";
import TransactionHistory from "./TransactionHistory";
import SendTransaction from "./SendTransaction";
import AccountInfo from "./AccountInfo";
import ErrorDisplay from "./ErrorDisplay";
import SecuritySettings from "./SecuritySettings";
import AccountSettings from "./AccountSettings";

const Dashboard = () => {
  // Try to use SimplifiedWalletContext first, fall back to WalletContext
  const simplifiedWalletContext = useContext(SimplifiedWalletContext);
  const regularWalletContext = useContext(WalletContext);
  const secureWalletContext = useSecureWallet();

  // Choose the context that has values
  const walletContext = simplifiedWalletContext || regularWalletContext || {};

  // Extract values with fallbacks
  const activeAccount = walletContext.activeAccount;
  const balance = walletContext.balance || "0";
  const loading = walletContext.loading || false;
  const error = walletContext.error;

  const [activeTab, setActiveTab] = useState("accounts");

  if (loading) {
    return <div className="loading">Loading wallet...</div>;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  if (!activeAccount) {
    return (
      <div className="error">
        <h3>No account found</h3>
        <p>Please reload the extension or try in simplified mode.</p>
        <button
          className="refresh-button"
          onClick={() => window.location.reload()}
        >
          Refresh Page
        </button>
      </div>
    );
  }

  const handleLockClick = () => {
    if (secureWalletContext && secureWalletContext.lockWallet) {
      secureWalletContext.lockWallet();
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1 style={{ fontWeight: 'bold' }}>web3Wallet</h1>
        <div className="header-actions">
          <NetworkSelector />
          <button
            className="lock-btn"
            onClick={handleLockClick}
            title="Lock Wallet"
          >
            🔒
          </button>
        </div>
      </header>

      <AccountInfo />

      <div className="dashboard-tabs">
        <button
          className={`tab ${activeTab === "accounts" ? "active" : ""}`}
          onClick={() => setActiveTab("accounts")}
        >
          Assets
        </button>
        <button
          className={`tab ${activeTab === "send" ? "active" : ""}`}
          onClick={() => setActiveTab("send")}
        >
          Send
        </button>
        <button
          className={`tab ${activeTab === "transactions" ? "active" : ""}`}
          onClick={() => setActiveTab("transactions")}
        >
          Activity
        </button>
        <button
          className={`tab ${activeTab === "account_settings" ? "active" : ""}`}
          onClick={() => setActiveTab("account_settings")}
        >
          Account
        </button>
        <button
          className={`tab ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          Settings
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === "accounts" && (
          <div className="assets">
            <div className="asset">
              <div className="asset-info">
                <div className="asset-name">
                  {activeAccount && activeAccount.name}
                </div>
                <div className="asset-balance">{balance} ETH</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "send" && <SendTransaction />}

        {activeTab === "transactions" && <TransactionHistory />}

        {activeTab === "account_settings" && <AccountSettings />}

        {activeTab === "settings" && <SecuritySettings />}
      </div>
    </div>
  );
};

export default Dashboard;
