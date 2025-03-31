import React, { createContext, useState, useEffect, useContext } from "react";
import {
  SimplifiedWalletContext,
  SimplifiedWalletProvider,
} from "./SimplifiedWalletContext";
import { encryptData, decryptData, LockTimer } from "../utils/passwordUtils";

export const SecureWalletContext = createContext();

export const SecureWalletProvider = ({ children }) => {
  const [isLocked, setIsLocked] = useState(true);
  const [hasPassword, setHasPassword] = useState(false);
  const [passwordHash, setPasswordHash] = useState(null);
  const [currentPassword, setCurrentPassword] = useState(null);
  const [loading, setLoading] = useState(true);
  const [walletData, setWalletData] = useState(null);
  const [error, setError] = useState(null);

  // Create a lock timer
  const lockTimer = React.useMemo(() => {
    return new LockTimer(15, () => lockWallet());
  }, []);

  // Initialize on component mount
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);

        // Check if there's a password hash stored
        chrome.storage.local.get(
          ["passwordHash", "hasPassword", "autoLockTime"],
          (result) => {
            if (result.hasPassword && result.passwordHash) {
              setHasPassword(true);
              setPasswordHash(result.passwordHash);
            } else {
              setHasPassword(false);
              setPasswordHash(null);
            }

            // Update lock timer if custom auto-lock time is set
            if (result.autoLockTime) {
              lockTimer.timeoutMinutes = result.autoLockTime;
            }

            setLoading(false);
          }
        );
      } catch (err) {
        console.error("Error initializing secure wallet:", err);
        setError("Failed to initialize secure wallet");
        setLoading(false);
      }
    };

    init();

    // Add event listeners to reset the lock timer
    const resetLockTimer = () => lockTimer.resetTimer();
    window.addEventListener("mousedown", resetLockTimer);
    window.addEventListener("keydown", resetLockTimer);
    window.addEventListener("touchstart", resetLockTimer);

    // Listen for wallet data updates
    const handleWalletDataUpdate = async (e) => {
      const updatedData = e.detail;
      if (currentPassword && updatedData) {
        await saveEncryptedWalletData(updatedData);
      }
    };

    // Listen for active wallet changes
    const handleActiveWalletChange = async (e) => {
      if (currentPassword && walletData) {
        const updatedData = {
          ...walletData,
          activeWallet: e.detail.activeWallet,
        };
        await saveEncryptedWalletData(updatedData);
      }
    };

    // Listen for wallet resets
    const handleWalletReset = async () => {
      if (currentPassword) {
        chrome.storage.local.remove(["encryptedWalletData"]);
        setWalletData(null);
      }
    };

    window.addEventListener("wallet_data_updated", handleWalletDataUpdate);
    window.addEventListener("active_wallet_changed", handleActiveWalletChange);
    window.addEventListener("wallet_data_reset", handleWalletReset);

    return () => {
      // Clean up event listeners
      window.removeEventListener("mousedown", resetLockTimer);
      window.removeEventListener("keydown", resetLockTimer);
      window.removeEventListener("touchstart", resetLockTimer);
      window.removeEventListener("wallet_data_updated", handleWalletDataUpdate);
      window.removeEventListener(
        "active_wallet_changed",
        handleActiveWalletChange
      );
      window.removeEventListener("wallet_data_reset", handleWalletReset);

      // Clear the lock timer
      lockTimer.clearTimer();
    };
  }, [lockTimer, currentPassword, walletData]);

  // Set up a password for the wallet
  const setupPassword = async (password, hash) => {
    try {
      setCurrentPassword(password);
      setPasswordHash(hash);
      setHasPassword(true);
      setIsLocked(false);

      // Store password hash in local storage
      chrome.storage.local.set({
        passwordHash: hash,
        hasPassword: true,
      });

      // Start the lock timer
      lockTimer.resetTimer();

      return true;
    } catch (err) {
      console.error("Error setting up password:", err);
      setError("Failed to set up password");
      return false;
    }
  };

  // Unlock the wallet with password
  const unlockWallet = async (password, hash) => {
    try {
      setCurrentPassword(password);
      setIsLocked(false);

      // Start the lock timer
      lockTimer.resetTimer();

      // Try to decrypt any existing encrypted wallet data
      chrome.storage.local.get(["encryptedWalletData"], async (result) => {
        if (result.encryptedWalletData) {
          try {
            const decryptedData = await decryptData(
              result.encryptedWalletData,
              password
            );
            setWalletData(decryptedData);

            // Dispatch event with decrypted data for the wallet components
            window.dispatchEvent(
              new CustomEvent("encrypted_wallet_data_ready", {
                detail: decryptedData,
              })
            );
          } catch (err) {
            console.warn("Could not decrypt wallet data:", err);
            // This isn't fatal - the wallet may be new or reset
          }
        }
      });

      return true;
    } catch (err) {
      console.error("Error unlocking wallet:", err);
      setError("Failed to unlock wallet");
      return false;
    }
  };

  // Lock the wallet
  const lockWallet = () => {
    setIsLocked(true);
    setCurrentPassword(null);
  };

  // Change the wallet password
  const changePassword = async (currentPass, newPassword, newHash) => {
    try {
      // Verify the current password
      if (currentPass !== currentPassword) {
        throw new Error("Current password is incorrect");
      }

      // Get any existing wallet data
      let walletDataToEncrypt = walletData;
      if (!walletDataToEncrypt) {
        // Try to get from storage and decrypt
        const result = await new Promise((resolve) =>
          chrome.storage.local.get(["encryptedWalletData"], resolve)
        );

        if (result.encryptedWalletData) {
          try {
            walletDataToEncrypt = await decryptData(
              result.encryptedWalletData,
              currentPass
            );
          } catch (err) {
            console.warn("Could not decrypt existing wallet data:", err);
            walletDataToEncrypt = {};
          }
        } else {
          walletDataToEncrypt = {};
        }
      }

      // Re-encrypt with the new password
      const newEncryptedData = await encryptData(
        walletDataToEncrypt,
        newPassword
      );

      // Update storage
      chrome.storage.local.set({
        passwordHash: newHash,
        encryptedWalletData: newEncryptedData,
      });

      // Update state
      setPasswordHash(newHash);
      setCurrentPassword(newPassword);

      return true;
    } catch (err) {
      console.error("Error changing password:", err);
      setError("Failed to change password: " + err.message);
      return false;
    }
  };

  // Save wallet data encrypted with the current password
  const saveEncryptedWalletData = async (data) => {
    if (!currentPassword) {
      console.error("Cannot save wallet data: wallet is locked");
      return false;
    }

    try {
      const encryptedData = await encryptData(data, currentPassword);

      // Save to storage
      chrome.storage.local.set({ encryptedWalletData: encryptedData });

      // Update state
      setWalletData(data);

      return true;
    } catch (err) {
      console.error("Error saving encrypted wallet data:", err);
      setError("Failed to save wallet data");
      return false;
    }
  };

  // Reset the wallet
  const resetWallet = async () => {
    try {
      // Clear all wallet data
      chrome.storage.local.remove([
        "passwordHash",
        "hasPassword",
        "encryptedWalletData",
        "wallets",
        "activeWallet",
        "transactions",
        "hasWallet",
      ]);

      // Reset state
      setIsLocked(true);
      setHasPassword(false);
      setPasswordHash(null);
      setCurrentPassword(null);
      setWalletData(null);

      return true;
    } catch (err) {
      console.error("Error resetting wallet:", err);
      setError("Failed to reset wallet");
      return false;
    }
  };

  const value = {
    isLocked,
    hasPassword,
    passwordHash,
    loading,
    error,
    setupPassword,
    unlockWallet,
    lockWallet,
    changePassword,
    saveEncryptedWalletData,
    resetWallet,
  };

  return (
    <SecureWalletContext.Provider value={value}>
      {!loading &&
        (isLocked ? (
          children
        ) : (
          <SimplifiedWalletProvider>{children}</SimplifiedWalletProvider>
        ))}
    </SecureWalletContext.Provider>
  );
};

// Custom hook for using the secure wallet context
export const useSecureWallet = () => {
  const context = useContext(SecureWalletContext);
  if (!context) {
    throw new Error(
      "useSecureWallet must be used within a SecureWalletProvider"
    );
  }
  return context;
};
