import React, { useContext, useState, useEffect } from "react";
import { WalletContext } from "../context/WalletContext";
import { SimplifiedWalletContext } from "../context/SimplifiedWalletContext";

const AccountSettings = () => {
  // Try to use SimplifiedWalletContext first, fall back to WalletContext
  const simplifiedWalletContext = useContext(SimplifiedWalletContext);
  const regularWalletContext = useContext(WalletContext);

  // Choose the context that has values
  const walletContext = simplifiedWalletContext || regularWalletContext || {};

  // Extract values with fallbacks
  const activeAccount = walletContext.activeAccount;
  const accounts = walletContext.accounts || {};
  const setActiveAccount = walletContext.setActiveAccount || (() => {});

  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [privateKeyCopied, setPrivateKeyCopied] = useState(false);
  const [mnemonicCopied, setMnemonicCopied] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [newAccountName, setNewAccountName] = useState("");

  useEffect(() => {
    if (activeAccount) {
      setNewAccountName(activeAccount.name || "");
    }
  }, [activeAccount]);

  const handleShowPrivateKey = () => {
    // In a real app, you would verify the password here
    // For this example, we'll just toggle showing the private key
    setShowPrivateKey(true);
    setShowMnemonic(false);
  };

  const handleShowMnemonic = () => {
    // In a real app, you would verify the password here
    // For this example, we'll just toggle showing the mnemonic
    setShowMnemonic(true);
    setShowPrivateKey(false);
  };

  const handleCopyPrivateKey = () => {
    if (activeAccount?.privateKey) {
      navigator.clipboard.writeText(activeAccount.privateKey);
      setPrivateKeyCopied(true);
      setTimeout(() => setPrivateKeyCopied(false), 2000);
    }
  };

  const handleCopyMnemonic = () => {
    if (activeAccount?.mnemonic) {
      navigator.clipboard.writeText(activeAccount.mnemonic);
      setMnemonicCopied(true);
      setTimeout(() => setMnemonicCopied(false), 2000);
    }
  };

  const handleUpdateAccountName = () => {
    if (!newAccountName.trim()) {
      setError("Account name cannot be empty");
      return;
    }

    if (activeAccount) {
      const updatedAccount = { ...activeAccount, name: newAccountName.trim() };
      const updatedAccounts = { ...accounts };
      updatedAccounts[activeAccount.address] = updatedAccount;

      // Update in storage
      try {
        chrome.storage.local.set({ accounts: updatedAccounts });
        // Update active account
        setActiveAccount(updatedAccount);
        setIsEditingName(false);
        setError("");
      } catch (err) {
        setError("Failed to update account name: " + err.message);
      }
    }
  };

  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!activeAccount) {
    return <div className="no-account">No active account selected</div>;
  }

  return (
    <div className="account-settings">
      <h3>Account Settings</h3>

      <div className="settings-section">
        <h4>Account Information</h4>

        <div className="account-detail">
          <span className="detail-label">Account Address</span>
          <div className="detail-value address-container">
            <span className="address-text">{activeAccount.address}</span>
            <button
              className="copy-btn"
              onClick={() => {
                navigator.clipboard.writeText(activeAccount.address);
              }}
              title="Copy to clipboard"
            >
              📋
            </button>
          </div>
        </div>

        <div className="account-detail">
          <span className="detail-label">Account Name</span>
          {!isEditingName ? (
            <div className="detail-value name-container">
              <span>{activeAccount.name}</span>
              <button
                className="edit-btn"
                onClick={() => setIsEditingName(true)}
                title="Edit name"
              >
                ✏️
              </button>
            </div>
          ) : (
            <div className="edit-name-container">
              <input
                type="text"
                value={newAccountName}
                onChange={(e) => setNewAccountName(e.target.value)}
                placeholder="Account Name"
                className="edit-name-input"
              />
              <div className="edit-actions">
                <button
                  className="save-btn"
                  onClick={handleUpdateAccountName}
                  title="Save"
                >
                  ✓
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => {
                    setIsEditingName(false);
                    setNewAccountName(activeAccount.name || "");
                  }}
                  title="Cancel"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="settings-section">
        <h4>Security & Backup</h4>
        <div className="warning-box">
          <p>
            <strong>⚠️ Warning:</strong> Keep your private key and recovery
            phrase secret. Anyone with access to them has full control of your
            account.
          </p>
        </div>

        <div className="security-buttons">
          <button className="export-btn" onClick={handleShowPrivateKey}>
            Export Private Key
          </button>
          <button
            className="export-btn"
            onClick={handleShowMnemonic}
            disabled={!activeAccount.mnemonic}
          >
            Show Recovery Phrase
          </button>
        </div>

        {showPrivateKey && (
          <div className="secret-box">
            <h5>Private Key</h5>
            <div className="private-key-display">
              <div className="secret-text">{activeAccount.privateKey}</div>
              <button
                className={`copy-secret-btn ${
                  privateKeyCopied ? "copied" : ""
                }`}
                onClick={handleCopyPrivateKey}
              >
                {privateKeyCopied ? "Copied! ✓" : "Copy 📋"}
              </button>
            </div>
            <button
              className="hide-btn"
              onClick={() => setShowPrivateKey(false)}
            >
              Hide Private Key
            </button>
          </div>
        )}

        {showMnemonic && activeAccount.mnemonic && (
          <div className="secret-box">
            <h5>Recovery Phrase</h5>
            <div className="mnemonic-display">
              <div className="secret-text">{activeAccount.mnemonic}</div>
              <button
                className={`copy-secret-btn ${mnemonicCopied ? "copied" : ""}`}
                onClick={handleCopyMnemonic}
              >
                {mnemonicCopied ? "Copied! ✓" : "Copy 📋"}
              </button>
            </div>
            <button className="hide-btn" onClick={() => setShowMnemonic(false)}>
              Hide Recovery Phrase
            </button>
          </div>
        )}
      </div>

      {error && <div className="settings-error">{error}</div>}
    </div>
  );
};

export default AccountSettings;
