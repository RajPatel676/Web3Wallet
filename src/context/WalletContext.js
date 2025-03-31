import React, { createContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import * as bip39 from "bip39";

export const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [mnemonic, setMnemonic] = useState("");
  const [accounts, setAccounts] = useState({});
  const [activeAccount, setActiveAccount] = useState(null);
  const [activeNetwork, setActiveNetwork] = useState("ETHEREUM_SEPOLIA");
  const [networks, setNetworks] = useState({
    ETHEREUM_SEPOLIA: {
      chainId: "0xaa36a7",
      chainName: "Ethereum Sepolia",
      nativeCurrency: {
        name: "Sepolia Ether",
        symbol: "ETH",
        decimals: 18,
      },
      rpcUrls: ["https://sepolia.infura.io/v3/"],
      blockExplorerUrls: ["https://sepolia.etherscan.io"],
    },
    POLYGON_AMOY: {
      chainId: "0x13881",
      chainName: "Polygon Amoy",
      nativeCurrency: {
        name: "MATIC",
        symbol: "MATIC",
        decimals: 18,
      },
      rpcUrls: ["https://polygon-amoy.infura.io/v3/"],
      blockExplorerUrls: ["https://amoy-explorer.polygon.technology"],
    },
  });
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState("0");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create a new account
  const createAccount = useCallback(
    (name) => {
      if (!mnemonic) return null;

      try {
        // Generate wallet from mnemonic
        const wallet = ethers.Wallet.fromMnemonic(mnemonic);
        const newAccount = {
          name,
          address: wallet.address,
          privateKey: wallet.privateKey,
        };

        const updatedAccounts = {
          ...accounts,
          [wallet.address]: newAccount,
        };

        setAccounts(updatedAccounts);
        setActiveAccount(newAccount);

        // Save to storage
        chrome.storage.local.set({ accounts: updatedAccounts });

        return newAccount;
      } catch (error) {
        console.error("Error creating account:", error);
        setError("Failed to create account: " + error.message);
        return null;
      }
    },
    [mnemonic, accounts]
  );

  // Initialize wallet from storage or create a new one
  useEffect(() => {
    try {
      chrome.storage.local.get(
        ["mnemonic", "accounts", "activeNetwork", "networks", "transactions"],
        (result) => {
          try {
            if (result.mnemonic) {
              setMnemonic(result.mnemonic);
            } else {
              // Generate new mnemonic
              const newMnemonic = bip39.generateMnemonic();
              setMnemonic(newMnemonic);
              chrome.storage.local.set({ mnemonic: newMnemonic });
            }

            if (result.networks) {
              setNetworks(result.networks);
            } else {
              // Initialize with default networks if not found
              chrome.storage.local.set({ networks });
            }

            if (result.activeNetwork) {
              setActiveNetwork(result.activeNetwork);
            }

            if (result.transactions) {
              setTransactions(result.transactions);
            }

            if (result.accounts && Object.keys(result.accounts).length > 0) {
              setAccounts(result.accounts);
              setActiveAccount(Object.values(result.accounts)[0]);
              setLoading(false);
            } else {
              // Create default account after slight delay to ensure mnemonic is set
              setTimeout(() => {
                const defaultAccount = createAccount("Account 1");
                if (defaultAccount) {
                  setLoading(false);
                } else {
                  setError("Failed to create default account");
                  setLoading(false);
                }
              }, 500);
            }
          } catch (err) {
            console.error("Error in wallet initialization:", err);
            setError("Wallet initialization error: " + err.message);
            setLoading(false);
          }
        }
      );
    } catch (err) {
      console.error("Chrome storage error:", err);
      setError("Chrome storage error: " + err.message);
      setLoading(false);
    }
  }, []);

  // Get account balance when active account or network changes
  useEffect(() => {
    if (activeAccount && networks[activeNetwork]) {
      fetchBalance();
    }
  }, [activeAccount, activeNetwork]);

  // Fetch balance for active account
  const fetchBalance = useCallback(async () => {
    if (!activeAccount) return;

    try {
      const network = networks[activeNetwork];
      const rpcUrl = network.rpcUrls[0];
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const balance = await provider.getBalance(activeAccount.address);
      setBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  }, [activeAccount, activeNetwork, networks]);

  // Switch active network
  const switchNetwork = useCallback(
    (networkId) => {
      if (networks[networkId]) {
        setActiveNetwork(networkId);
        chrome.storage.local.set({ activeNetwork: networkId });
      }
    },
    [networks]
  );

  // Send a transaction
  const sendTransaction = useCallback(
    async (to, amount, data = "") => {
      if (!activeAccount) return { success: false, error: "No active account" };

      try {
        const network = networks[activeNetwork];
        const rpcUrl = network.rpcUrls[0];
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers.Wallet(activeAccount.privateKey, provider);

        const tx = await wallet.sendTransaction({
          to,
          value: ethers.parseEther(amount.toString()),
          data,
        });

        // Add to transactions list
        const newTx = {
          hash: tx.hash,
          from: activeAccount.address,
          to,
          value: amount,
          network: activeNetwork,
          timestamp: Date.now(),
          status: "pending",
        };

        const updatedTxs = [...transactions, newTx];
        setTransactions(updatedTxs);
        chrome.storage.local.set({ transactions: updatedTxs });

        // Emit event for content script
        window.dispatchEvent(
          new CustomEvent("transaction_completed", {
            detail: { txHash: tx.hash },
          })
        );

        // Wait for confirmation
        const receipt = await tx.wait();

        // Update transaction status
        const finalTxs = updatedTxs.map((t) =>
          t.hash === tx.hash ? { ...t, status: "confirmed" } : t
        );
        setTransactions(finalTxs);
        chrome.storage.local.set({ transactions: finalTxs });

        // Refresh balance
        fetchBalance();

        return { success: true, txHash: tx.hash };
      } catch (error) {
        console.error("Error sending transaction:", error);
        return { success: false, error: error.message };
      }
    },
    [activeAccount, activeNetwork, networks, transactions, fetchBalance]
  );

  const value = {
    accounts,
    activeAccount,
    activeNetwork,
    networks,
    transactions,
    balance,
    loading,
    error,
    createAccount,
    switchNetwork,
    sendTransaction,
    setActiveAccount,
    fetchBalance,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};
