import React, { useContext, useState, useRef, useEffect } from "react";
import { WalletContext } from "../context/WalletContext";
import { SimplifiedWalletContext } from "../context/SimplifiedWalletContext";

const AccountInfo = () => {
  // Try to use SimplifiedWalletContext first, fall back to WalletContext
  const simplifiedWalletContext = useContext(SimplifiedWalletContext);
  const regularWalletContext = useContext(WalletContext);

  // Choose the context that has values
  const walletContext = simplifiedWalletContext || regularWalletContext || {};

  // Extract values with fallbacks
  const activeAccount = walletContext.activeAccount;
  const accounts = walletContext.accounts || {};
  const setActiveAccount = walletContext.setActiveAccount || (() => {});
  const createAccount = walletContext.createAccount || (() => null);
  const balance = walletContext.balance || "0";
  const activeNetwork = walletContext.activeNetwork || "";
  const networks = walletContext.networks || {};
  const isBalanceLoading = walletContext.isBalanceLoading || false;
  const fetchBalance = walletContext.fetchBalance || (() => {});
  const resetWallet = walletContext.resetWallet || (() => {});

  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [newAccountName, setNewAccountName] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus input when creating account
  useEffect(() => {
    if (isCreatingAccount && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreatingAccount]);

  // Reset refreshing animation
  useEffect(() => {
    if (!isBalanceLoading && refreshing) {
      setRefreshing(false);
    }
  }, [isBalanceLoading]);

  const handleCreateAccount = () => {
    if (newAccountName.trim() === "") {
      setValidationError("Account name cannot be empty");
      return;
    }

    createAccount(newAccountName);
    setNewAccountName("");
    setIsCreatingAccount(false);
    setValidationError("");
  };

  const handleSelectAccount = (account) => {
    setActiveAccount(account);
    setShowDropdown(false);
  };

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleCopyAddress = () => {
    if (activeAccount?.address) {
      navigator.clipboard.writeText(activeAccount.address);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleRefreshBalance = () => {
    if (fetchBalance && !isBalanceLoading) {
      setRefreshing(true);
      fetchBalance();
    }
  };

  const handleResetWallet = () => {
    if (resetWallet) {
      resetWallet();
      setShowResetConfirm(false);
    }
  };

  // Get currency symbol based on active network
  const getCurrencySymbol = () => {
    if (networks[activeNetwork] && networks[activeNetwork].nativeCurrency) {
      return networks[activeNetwork].nativeCurrency.symbol;
    }
    return "ETH";
  };

  // Generate random color based on address for account icon
  const getAccountColor = (address) => {
    if (!address) return "#cccccc";
    const hash = address.slice(2, 8);
    return `#${hash}`;
  };

  // Format balance with proper decimals
  const formatBalance = (balanceStr) => {
    // Try to parse the balance
    try {
      const bal = parseFloat(balanceStr);
      // If the balance is very small (but not zero), show more decimals
      if (bal > 0 && bal < 0.001) {
        return bal.toFixed(8);
      }
      // Otherwise show 6 decimals
      return bal.toFixed(6);
    } catch (e) {
      return balanceStr;
    }
  };

  if (!activeAccount) {
    return null;
  }

  return (
    <div className="account-info">
      <div className="account-balance-card">
        <div className="balance-header">
          <div className="balance-label">Balance</div>
          <button
            className={`refresh-balance-btn ${refreshing ? "refreshing" : ""}`}
            onClick={handleRefreshBalance}
            disabled={isBalanceLoading}
            title="Refresh balance"
          >
            ↻
          </button>
        </div>
        <div className={`balance-amount ${isBalanceLoading ? "loading" : ""}`}>
          {isBalanceLoading ? (
            <span className="balance-placeholder">Loading...</span>
          ) : (
            <>
              {formatBalance(balance)}{" "}
              <span className="balance-symbol">{getCurrencySymbol()}</span>
            </>
          )}
        </div>
        {isBalanceLoading && <div className="balance-loading-indicator"></div>}
      </div>

      <div className="account-selector" ref={dropdownRef}>
        <div
          className="active-account"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <div
            className="account-icon"
            style={{ backgroundColor: getAccountColor(activeAccount.address) }}
          >
            {activeAccount.name?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="account-details">
            <div className="account-name">{activeAccount?.name}</div>
            <div className="account-address">
              {formatAddress(activeAccount?.address)}
            </div>
          </div>
          <div className={`dropdown-arrow ${showDropdown ? "open" : ""}`}>
            ▼
          </div>
        </div>

        {showDropdown && (
          <div className="account-dropdown">
            <div className="dropdown-header">My Accounts</div>
            {Object.values(accounts).map((account) => (
              <div
                key={account.address}
                className={`account-item ${
                  activeAccount?.address === account.address ? "active" : ""
                }`}
                onClick={() => handleSelectAccount(account)}
              >
                <div
                  className="account-item-icon"
                  style={{ backgroundColor: getAccountColor(account.address) }}
                >
                  {account.name?.charAt(0).toUpperCase() || "A"}
                </div>
                <div className="account-item-details">
                  <div className="account-item-name">{account.name}</div>
                  <div className="account-item-address">
                    {formatAddress(account.address)}
                  </div>
                </div>
                {activeAccount?.address === account.address && (
                  <div className="active-indicator">✓</div>
                )}
              </div>
            ))}

            {!isCreatingAccount ? (
              <div
                className="create-account-button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCreatingAccount(true);
                  setValidationError("");
                }}
              >
                <span className="create-icon">+</span> Create New Account
              </div>
            ) : (
              <div
                className="create-account-form"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Account Name"
                  value={newAccountName}
                  onChange={(e) => {
                    setNewAccountName(e.target.value);
                    if (validationError) setValidationError("");
                  }}
                  className={`account-name-input ${
                    validationError ? "error" : ""
                  }`}
                />
                {validationError && (
                  <div className="validation-error">{validationError}</div>
                )}
                <div className="create-account-actions">
                  <button
                    className="cancel-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCreatingAccount(false);
                      setNewAccountName("");
                      setValidationError("");
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="create-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateAccount();
                    }}
                    disabled={!newAccountName.trim()}
                  >
                    Create
                  </button>
                </div>
              </div>
            )}

            <div
              className="reset-wallet-button"
              onClick={(e) => {
                e.stopPropagation();
                setShowResetConfirm(true);
              }}
            >
              Reset Wallet
            </div>

            {showResetConfirm && (
              <div
                className="reset-confirmation"
                onClick={(e) => e.stopPropagation()}
              >
                <p>Are you sure? This will remove all accounts and data.</p>
                <div className="reset-actions">
                  <button
                    className="cancel-reset"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowResetConfirm(false);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="confirm-reset"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResetWallet();
                    }}
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="account-address-display">
        <div className="address-label">Account Address:</div>
        <div className="address-container">
          <div className="address">{activeAccount?.address}</div>
          <button
            className={`copy-btn ${copySuccess ? "copied" : ""}`}
            onClick={handleCopyAddress}
          >
            {copySuccess ? "✓ Copied" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountInfo;
