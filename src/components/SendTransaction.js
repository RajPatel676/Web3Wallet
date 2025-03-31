import React, { useContext, useState, useEffect } from "react";
import { WalletContext } from "../context/WalletContext";
import { SimplifiedWalletContext } from "../context/SimplifiedWalletContext";

const SendTransaction = () => {
  // Try to use SimplifiedWalletContext first, fall back to WalletContext
  const simplifiedWalletContext = useContext(SimplifiedWalletContext);
  const regularWalletContext = useContext(WalletContext);

  // Choose the context that has values
  const walletContext = simplifiedWalletContext || regularWalletContext || {};

  // Extract values with fallbacks
  const sendTransaction =
    walletContext.sendTransaction ||
    (() => {
      return Promise.resolve({
        success: false,
        error: "Wallet not initialized",
      });
    });
  const balance = walletContext.balance || "0";
  const activeNetwork = walletContext.activeNetwork || "ETHEREUM_SEPOLIA";
  const networks = walletContext.networks || {
    ETHEREUM_SEPOLIA: {
      nativeCurrency: { symbol: "ETH" },
    },
  };
  const activeAccount = walletContext.activeAccount || {};

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [data, setData] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [estimatedFee, setEstimatedFee] = useState("0.0001"); // Simple static fee estimate

  // Clear status messages when inputs change
  useEffect(() => {
    if (error || success) {
      setError("");
      setSuccess("");
    }
  }, [recipient, amount, data]);

  const validateAddress = (address) => {
    // Basic Ethereum address validation
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const handleSetMaxAmount = () => {
    // Account for gas fee roughly
    const maxAmount = Math.max(
      0,
      parseFloat(balance) - parseFloat(estimatedFee)
    ).toFixed(6);
    setAmount(maxAmount);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate recipient address
    if (!recipient) {
      setError("Recipient address is required");
      return;
    }

    if (!validateAddress(recipient)) {
      setError("Invalid Ethereum address format");
      return;
    }

    // Validate amount
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    const totalNeeded = parseFloat(amount) + parseFloat(estimatedFee);
    if (totalNeeded > parseFloat(balance)) {
      setError(
        `Insufficient balance for transaction and gas fee (≈${estimatedFee} ${getCurrencySymbol()})`
      );
      return;
    }

    setLoading(true);

    try {
      const result = await sendTransaction(recipient, amount, data);

      if (result.success) {
        setSuccess(`Transaction submitted successfully!`);
        setRecipient("");
        setAmount("");
        setData("");
        // Display transaction info
        setTimeout(() => {
          setSuccess(
            `Transaction sent! Hash: ${result.txHash.substring(0, 10)}...`
          );
        }, 500);
      } else {
        setError(result.error || "Transaction failed");
      }
    } catch (err) {
      setError(err.message || "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Get currency symbol based on active network
  const getCurrencySymbol = () => {
    if (networks[activeNetwork] && networks[activeNetwork].nativeCurrency) {
      return networks[activeNetwork].nativeCurrency.symbol;
    }
    return "ETH";
  };

  return (
    <div className="send-transaction">
      <h3>Send {getCurrencySymbol()}</h3>

      {error && <div className="error-message">❌ {error}</div>}
      {success && <div className="success-message">✅ {success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>From</label>
          <div className="account-display">
            {activeAccount.address && (
              <div className="address-badge">
                {`${activeAccount.address.substring(
                  0,
                  6
                )}...${activeAccount.address.substring(38)}`}
              </div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label>Recipient Address</label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            className={`input-field ${
              recipient && !validateAddress(recipient) ? "input-error" : ""
            }`}
            disabled={loading}
          />
          {recipient && !validateAddress(recipient) && (
            <small className="validation-message">
              Please enter a valid Ethereum address
            </small>
          )}
        </div>

        <div className="form-group">
          <div className="amount-header">
            <label>Amount ({getCurrencySymbol()})</label>
            <button
              type="button"
              className="max-button"
              onClick={handleSetMaxAmount}
              disabled={loading}
            >
              MAX
            </button>
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            step="0.000001"
            min="0"
            className="input-field"
            disabled={loading}
          />
          <div className="balance-display">
            Available: {balance} {getCurrencySymbol()}
            <span className="fee-estimate">
              (Est. fee: {estimatedFee} {getCurrencySymbol()})
            </span>
          </div>
        </div>

        <div className="form-group">
          <label>Data (Optional)</label>
          <textarea
            value={data}
            onChange={(e) => setData(e.target.value)}
            placeholder="0x"
            className="input-field data-field"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          className={`send-button ${loading ? "loading" : ""}`}
          disabled={loading || !recipient || !amount || parseFloat(amount) <= 0}
        >
          {loading ? "Processing..." : "Send Transaction"}
        </button>
      </form>
    </div>
  );
};

export default SendTransaction;
