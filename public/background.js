// Background script for the wallet extension

// Network configurations
const NETWORKS = {
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
};

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  // Initialize storage with default values
  chrome.storage.local.set({
    activeNetwork: "ETHEREUM_SEPOLIA",
    networks: NETWORKS,
    accounts: {}, // Start with empty accounts
    transactions: [],
  });
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Open the extension popup
  chrome.windows.create({
    url: chrome.runtime.getURL("index.html"),
    type: "popup",
    width: 400,
    height: 600,
  });
});

// Message listener for handling requests from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "CONNECT_WALLET") {
    // Handle wallet connection request
    chrome.storage.local.get(["accounts"], (result) => {
      if (!result.accounts || Object.keys(result.accounts).length === 0) {
        // If no accounts, open the extension popup
        chrome.windows.create({
          url: chrome.runtime.getURL("index.html"),
          type: "popup",
          width: 400,
          height: 600,
        });
        sendResponse({
          success: false,
          error: "No accounts found. Opening wallet to create an account.",
        });
      } else {
        sendResponse({
          success: true,
          message: "Wallet connected successfully",
          accounts: result.accounts,
        });
      }
    });
    return true;
  }

  if (request.type === "GET_ACCOUNTS") {
    // Return connected accounts
    chrome.storage.local.get(["accounts"], (result) => {
      if (!result.accounts || Object.keys(result.accounts).length === 0) {
        sendResponse({
          success: false,
          error:
            "No accounts found. Please create an account in the extension.",
        });
      } else {
        sendResponse({
          success: true,
          accounts: result.accounts,
        });
      }
    });
    return true;
  }

  if (request.type === "SIGN_TRANSACTION") {
    // Handle transaction signing request
    chrome.windows.create({
      url:
        chrome.runtime.getURL("index.html") +
        "?action=approve&tx=" +
        encodeURIComponent(JSON.stringify(request.transaction)),
      type: "popup",
      width: 400,
      height: 600,
    });
    sendResponse({
      success: true,
      message: "Transaction signing request received",
    });
    return true;
  }

  if (request.type === "SIGN_MESSAGE") {
    // Handle message signing request
    chrome.windows.create({
      url:
        chrome.runtime.getURL("index.html") +
        "?action=sign&message=" +
        encodeURIComponent(request.message),
      type: "popup",
      width: 400,
      height: 600,
    });
    sendResponse({
      success: true,
      message: "Message signing request received",
    });
    return true;
  }

  if (request.type === "SWITCH_NETWORK") {
    // Handle network switching
    chrome.storage.local.set({ activeNetwork: request.network }, () => {
      sendResponse({
        success: true,
        message: "Network switched successfully",
        network: request.network,
      });
    });
    return true;
  }
});
