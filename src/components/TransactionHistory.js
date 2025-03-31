import React, { useContext } from "react";
import { WalletContext } from "../context/WalletContext";
import { SimplifiedWalletContext } from "../context/SimplifiedWalletContext";

const TransactionHistory = () => {
  // Try to use SimplifiedWalletContext first, fall back to WalletContext
  const simplifiedWalletContext = useContext(SimplifiedWalletContext);
  const regularWalletContext = useContext(WalletContext);

  // Choose the context that has values
  const walletContext = simplifiedWalletContext || regularWalletContext || {};

  // Extract values with fallbacks
  const transactions = walletContext.transactions || [];
  const networks = walletContext.networks || {};

  if (!transactions || transactions.length === 0) {
    return (
      <div className="transaction-history empty">
        <p>No transactions found</p>
        <div className="empty-state-icon">📝</div>
        <p className="empty-state-message">
          Your transactions will appear here
        </p>
      </div>
    );
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getCurrencySymbol = (networkId) => {
    if (networks[networkId] && networks[networkId].nativeCurrency) {
      return networks[networkId].nativeCurrency.symbol;
    }
    return "ETH";
  };

  const getBlockExplorer = (networkId) => {
    if (networks[networkId] && networks[networkId].blockExplorerUrls) {
      return networks[networkId].blockExplorerUrls[0];
    }
    return "https://etherscan.io";
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      pending: "Pending",
      confirmed: "Confirmed",
      failed: "Failed",
    };
    return statusMap[status] || status;
  };

  const getStatusIcon = (status) => {
    const iconMap = {
      pending: "⏳",
      confirmed: "✅",
      failed: "❌",
    };
    return iconMap[status] || "❓";
  };

  return (
    <div className="transaction-history">
      <h3>Transaction History</h3>

      <div className="transaction-list">
        {transactions
          .slice()
          .reverse()
          .map((tx) => (
            <div key={tx.hash} className={`transaction-item ${tx.status}`}>
              <div className="transaction-status">
                <span className="status-icon">{getStatusIcon(tx.status)}</span>
                <span className={`status-text ${tx.status}`}>
                  {getStatusLabel(tx.status)}
                </span>
              </div>

              <div className="transaction-details">
                <div className="transaction-type">
                  {tx.from &&
                  tx.to &&
                  tx.from.toLowerCase() === tx.to.toLowerCase()
                    ? "Self Transfer"
                    : "Send"}
                </div>

                <div className="transaction-addresses">
                  <div className="transaction-from">
                    <span className="label">From:</span>{" "}
                    {formatAddress(tx.from)}
                  </div>
                  <div className="transaction-to">
                    <span className="label">To:</span> {formatAddress(tx.to)}
                  </div>
                </div>

                <div className="transaction-network">
                  <span className="network-badge">
                    {networks[tx.network]?.chainName || tx.network}
                  </span>
                </div>

                <div className="transaction-amount">
                  <span className="amount-value">{tx.value}</span>
                  <span className="amount-symbol">
                    {getCurrencySymbol(tx.network)}
                  </span>
                </div>

                <div className="transaction-time">
                  {formatDate(tx.timestamp)}
                </div>
              </div>

              <div className="transaction-actions">
                <a
                  href={`${getBlockExplorer(tx.network)}/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="view-tx-button"
                >
                  View Details
                </a>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default TransactionHistory;
