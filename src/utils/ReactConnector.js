/**
 * ReactConnector.js
 *
 * This file provides React components and hooks for easy integration
 * with the Web3 Wallet extension.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

// Create a context for wallet state
const web3WalletContext = createContext(null);

/**
 * Provider component that wraps the application to provide wallet functionality
 */
export const web3WalletProvider = ({ children }) => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [error, setError] = useState(null);

  // Check if extension is available
  useEffect(() => {
    const checkExtension = () => {
      const available =
        typeof window !== "undefined" && window.web3Wallet !== undefined;
      setIsAvailable(available);

      if (available && window.web3Wallet.isWalletConnected()) {
        setIsConnected(true);
        setAccount(window.web3Wallet.getAccount());
      }
    };

    checkExtension();

    // Listen for wallet initialization
    const initHandler = () => {
      setIsAvailable(true);
    };

    window.addEventListener("wallet_initialized", initHandler);

    return () => {
      window.removeEventListener("wallet_initialized", initHandler);
    };
  }, []);

  // Set up event listeners
  useEffect(() => {
    if (!isAvailable) return;

    const handleWalletConnected = (event) => {
      setIsConnected(true);
      setAccount(event.detail.account);
      setError(null);
    };

    const handleNetworkChanged = (event) => {
      setChainId(event.detail.networkId);
    };

    window.addEventListener("wallet_connected", handleWalletConnected);
    window.addEventListener("network_changed", handleNetworkChanged);

    return () => {
      window.removeEventListener("wallet_connected", handleWalletConnected);
      window.removeEventListener("network_changed", handleNetworkChanged);
    };
  }, [isAvailable]);

  // Connect to wallet
  const connect = useCallback(async () => {
    setError(null);

    if (!isAvailable) {
      const errorMsg = "Web3 Wallet extension not installed";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      const result = await window.web3Wallet.connect();
      return { success: true, account: result.account };
    } catch (error) {
      const errorMsg = error.message || "Failed to connect";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [isAvailable]);

  // Send transaction
  const sendTransaction = useCallback(
    async (to, value, data = "") => {
      setError(null);

      if (!isAvailable) {
        const errorMsg = "Web3 Wallet extension not installed";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      if (!isConnected) {
        const errorMsg = "Wallet not connected";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      try {
        const result = await window.web3Wallet.sendTransaction({
          to,
          value,
          data,
        });
        return { success: true, txHash: result.txHash };
      } catch (error) {
        const errorMsg = error.message || "Transaction failed";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    },
    [isAvailable, isConnected]
  );

  // Switch network
  const switchNetwork = useCallback(
    async (networkId) => {
      setError(null);

      if (!isAvailable) {
        const errorMsg = "Web3 Wallet extension not installed";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      try {
        const result = await window.web3Wallet.switchNetwork(networkId);
        return { success: true, networkId: result.networkId };
      } catch (error) {
        const errorMsg = error.message || "Network switch failed";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    },
    [isAvailable]
  );

  // Context value
  const value = {
    isAvailable,
    isConnected,
    account,
    chainId,
    error,
    connect,
    sendTransaction,
    switchNetwork,
  };

  return (
    <web3WalletContext.Provider value={value}>
      {children}
    </web3WalletContext.Provider>
  );
};

/**
 * Hook to use web3Wallet in any component
 * @returns {Object} Wallet state and methods
 */
export const useweb3Wallet = () => {
  const context = useContext(web3WalletContext);
  if (!context) {
    throw new Error("useweb3Wallet must be used within a web3WalletProvider");
  }
  return context;
};

/**
 * Connect Button component for easy integration
 */
export const ConnectButton = ({
  onSuccess,
  onError,
  connectText = "Connect Wallet",
  connectedText = "Connected",
  className = "",
  style = {},
}) => {
  const { isAvailable, isConnected, connect, account } = useweb3Wallet();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    if (isConnected) return;

    setIsConnecting(true);
    const result = await connect();
    setIsConnecting(false);

    if (result.success) {
      onSuccess && onSuccess(result.account);
    } else {
      onError && onError(result.error);
    }
  };

  if (!isAvailable) {
    return (
      <button
        className={`web3Wallet-button ${className}`}
        style={style}
        onClick={() =>
          window.open(
            "https://chrome.google.com/webstore/detail/web3Wallet/",
            "_blank"
          )
        }
      >
        Install Web3 Wallet
      </button>
    );
  }

  return (
    <button
      className={`web3Wallet-button ${isConnected ? "connected" : ""
        } ${className}`}
      style={style}
      onClick={handleConnect}
      disabled={isConnecting || isConnected}
    >
      {isConnecting
        ? "Connecting..."
        : isConnected
          ? `${connectedText}: ${account.slice(0, 6)}...${account.slice(-4)}`
          : connectText}
    </button>
  );
};

/**
 * Network Selector component for easy network switching
 */
export const NetworkSelector = ({
  networks = {
    ETHEREUM_SEPOLIA: "Sepolia",
    POLYGON_AMOY: "Polygon Amoy",
  },
  onChange,
  className = "",
  style = {},
}) => {
  const { switchNetwork, chainId } = useweb3Wallet();
  const [isLoading, setIsLoading] = useState(false);

  const handleNetworkChange = async (event) => {
    const networkId = event.target.value;
    setIsLoading(true);
    const result = await switchNetwork(networkId);
    setIsLoading(false);

    if (result.success && onChange) {
      onChange(networkId);
    }
  };

  return (
    <select
      className={`web3Wallet-network-select ${className}`}
      onChange={handleNetworkChange}
      value={chainId || Object.keys(networks)[0]}
      disabled={isLoading}
      style={style}
    >
      {Object.entries(networks).map(([id, name]) => (
        <option key={id} value={id}>
          {name}
        </option>
      ))}
    </select>
  );
};

// Export a complete package
export default {
  web3WalletProvider,
  useweb3Wallet,
  ConnectButton,
  NetworkSelector,
};
