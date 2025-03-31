import React, { useState } from "react";
import { useSecureWallet } from "../context/SecureWalletContext";
import PasswordSetup from "./PasswordSetup";

const LockScreen = () => {
  const {
    isLocked,
    hasPassword,
    passwordHash,
    unlockWallet,
    setupPassword,
    resetWallet,
  } = useSecureWallet();

  const [showReset, setShowReset] = useState(false);

  // Handle password setup or verification
  const handlePasswordSet = async (password, hash) => {
    if (hasPassword) {
      // Unlock the wallet
      await unlockWallet(password, hash);
    } else {
      // Set up a new password
      await setupPassword(password, hash);
    }
  };

  // Handle wallet reset
  const handleResetWallet = async () => {
    if (
      window.confirm(
        "WARNING: This will delete ALL wallet data and cannot be undone. Are you sure?"
      )
    ) {
      await resetWallet();
      setShowReset(false);
    }
  };

  return (
    <div className="lock-screen">
      <div className="lock-screen-content">
        <div className="lock-screen-header">
          <div className="wallet-logo"></div>
          <h2>{hasPassword ? "Wallet Locked" : "Set Up Wallet Password"}</h2>
        </div>

        {showReset ? (
          <div className="reset-wallet-panel">
            <p className="warning-text">
              Are you sure you want to reset the wallet? This will permanently
              delete all your wallet data including accounts, transactions, and
              settings. This action cannot be undone.
            </p>

            <div className="reset-actions">
              <button
                className="cancel-reset-btn"
                onClick={() => setShowReset(false)}
              >
                Cancel
              </button>
              <button className="confirm-reset-btn" onClick={handleResetWallet}>
                Reset Wallet
              </button>
            </div>
          </div>
        ) : (
          <>
            <PasswordSetup
              onPasswordSet={handlePasswordSet}
              existingHash={hasPassword ? passwordHash : null}
            />

            {hasPassword && (
              <button
                className="reset-wallet-link"
                onClick={() => setShowReset(true)}
              >
                Forgot Password? Reset Wallet
              </button>
            )}
          </>
        )}

        <div className="lock-screen-footer">
          <p>
            Your wallet data is encrypted and protected by your password.
            {hasPassword
              ? " Enter your password to unlock your wallet."
              : " Create a strong password to secure your wallet."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LockScreen;
