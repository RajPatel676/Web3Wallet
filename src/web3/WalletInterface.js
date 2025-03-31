import React from "react";

// web3Wallet Interface for React Applications

/**
 * A React hook to connect to the Web3 Wallet extension
 * @returns {Object} Wallet interface methods and state
 */
export const useweb3Wallet = () => {
  const [isConnected, setIsConnected] = React.useState(false);
  const [account, setAccount] = React.useState(null);
  const [chainId, setChainId] = React.useState(null);
  const [error, setError] = React.useState(null);

  // Check if extension is available
  const isAvailable = React.useMemo(() => {
    return typeof window !== "undefined" && window.web3Wallet !== undefined;
  }, []);

  // Initialize listener for wallet events
  React.useEffect(() => {
    if (!isAvailable) {
      setError("Web3 Wallet extension not installed");
      return;
    }

    const handleWalletConnected = (event) => {
      setIsConnected(true);
      setAccount(event.detail.account);
    };

    const handleNetworkChanged = (event) => {
      setChainId(event.detail.networkId);
    };

    window.addEventListener("wallet_connected", handleWalletConnected);
    window.addEventListener("network_changed", handleNetworkChanged);

    // Check initial state
    if (window.web3Wallet.isWalletConnected()) {
      setIsConnected(true);
      setAccount(window.web3Wallet.getAccount());
    }

    return () => {
      window.removeEventListener("wallet_connected", handleWalletConnected);
      window.removeEventListener("network_changed", handleNetworkChanged);
    };
  }, [isAvailable]);

  // Connect to wallet
  const connect = React.useCallback(async () => {
    if (!isAvailable) {
      setError("Web3 Wallet extension not installed");
      return { success: false, error: "Web3 Wallet extension not installed" };
    }

    try {
      const result = await window.web3Wallet.connect();
      return { success: true, account: result.account };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  }, [isAvailable]);

  // Send transaction
  const sendTransaction = React.useCallback(
    async (to, value, data = "") => {
      if (!isAvailable) {
        setError("Web3 Wallet extension not installed");
        return { success: false, error: "Web3 Wallet extension not installed" };
      }

      if (!isConnected) {
        setError("Wallet not connected");
        return { success: false, error: "Wallet not connected" };
      }

      try {
        const result = await window.web3Wallet.sendTransaction({
          to,
          value,
          data,
        });
        return { success: true, txHash: result.txHash };
      } catch (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }
    },
    [isAvailable, isConnected]
  );

  // Switch network
  const switchNetwork = React.useCallback(
    async (networkId) => {
      if (!isAvailable) {
        setError("Web3 Wallet extension not installed");
        return { success: false, error: "Web3 Wallet extension not installed" };
      }

      try {
        const result = await window.web3Wallet.switchNetwork(networkId);
        return { success: true, networkId: result.networkId };
      } catch (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }
    },
    [isAvailable]
  );

  return {
    isAvailable,
    isConnected,
    account,
    chainId,
    error,
    connect,
    sendTransaction,
    switchNetwork,
  };
};

/**
 * A React provider component to provide wallet functionality to the entire app
 */
export const web3WalletProvider = ({ children }) => {
  const walletInterface = useweb3Wallet();

  return (
    <web3WalletContext.Provider value={walletInterface}>
      {children}
    </web3WalletContext.Provider>
  );
};

// Create context
export const web3WalletContext = React.createContext(null);

// Hook to use wallet in components
export const useWallet = () => React.useContext(web3WalletContext);
