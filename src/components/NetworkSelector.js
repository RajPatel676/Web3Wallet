import React, { useContext } from "react";
import { WalletContext } from "../context/WalletContext";
import { SimplifiedWalletContext } from "../context/SimplifiedWalletContext";

const NetworkSelector = () => {
  // Try to use SimplifiedWalletContext first, fall back to WalletContext
  const simplifiedWalletContext = useContext(SimplifiedWalletContext);
  const regularWalletContext = useContext(WalletContext);

  // Choose the context that has values
  const walletContext = simplifiedWalletContext || regularWalletContext || {};

  // Extract values with fallbacks
  const networks = walletContext.networks || {};
  const activeNetwork = walletContext.activeNetwork || "ETHEREUM_SEPOLIA";
  const switchNetwork = walletContext.switchNetwork || (() => {});

  // Get network colors for visual indicator
  const getNetworkColor = (networkId) => {
    const networkColors = {
      ETHEREUM_SEPOLIA: "#6e94ff", // blue for Ethereum test networks
      POLYGON_AMOY: "#8247e5", // purple for Polygon
    };
    return networkColors[networkId] || "#aaaaaa";
  };

  const handleNetworkChange = (e) => {
    switchNetwork(e.target.value);
  };

  // Ensure we have some networks to display
  const hasNetworks = Object.keys(networks).length > 0;
  if (!hasNetworks) {
    return null;
  }

  return (
    <div className="network-selector">
      <div className="network-indicator">
        <span
          className="network-dot"
          style={{ backgroundColor: getNetworkColor(activeNetwork) }}
        />
        <select
          value={activeNetwork}
          onChange={handleNetworkChange}
          className="network-select"
        >
          {Object.keys(networks).map((networkId) => (
            <option key={networkId} value={networkId}>
              {networks[networkId].chainName}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default NetworkSelector;
