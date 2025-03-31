import React, { useEffect, useState, useContext } from "react";
import { WalletProvider } from "./context/WalletContext";
import {
  SimplifiedWalletContext,
  SimplifiedWalletProvider,
} from "./context/SimplifiedWalletContext";
import {
  SecureWalletProvider,
  useSecureWallet,
} from "./context/SecureWalletContext";
import Dashboard from "./components/Dashboard";
import WalletSetup from "./components/WalletSetup";
import LockScreen from "./components/LockScreen";

function App() {
  const [isSimplified, setIsSimplified] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Always use simplified mode which uses ethers.js
    setIsSimplified(true);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div className="loading">Loading Web3 Wallet...</div>;
  }

  // Use simplified wallet provider and conditionally render setup or dashboard
  return (
    <div className="App">

      {isSimplified ? (
        <SecureWalletProvider>
          <SecureWalletContent />
        </SecureWalletProvider>
      ) : (
        <WalletProvider>
          <Dashboard />
        </WalletProvider>
      )}
    </div>
  );
}

// Component to handle secured wallet content
function SecureWalletContent() {
  const { isLocked, loading } = useSecureWallet();

  if (loading) {
    return <div className="loading">Loading wallet state...</div>;
  }

  // If wallet is locked, show the lock screen
  if (isLocked) {
    return <LockScreen />;
  }

  // Otherwise, show the wallet content (setup or dashboard)
  return <WalletContent />;
}

// Component to render either wallet setup or dashboard based on wallet state
function WalletContent() {
  const { hasWallet, loading } = useContext(SimplifiedWalletContext);

  if (loading) {
    return <div className="loading">Loading wallet state...</div>;
  }

  return hasWallet ? <Dashboard /> : <WalletSetup />;
}

export default App;
