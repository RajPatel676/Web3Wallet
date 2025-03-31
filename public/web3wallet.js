// web3Wallet API implementation
console.log("web3Wallet: In-page script execution started");

window.web3Wallet = {
  isConnected: false,
  account: null,
  chainId: null,

  // Connect to the wallet
  connect: async function () {
    return new Promise((resolve, reject) => {
      window.postMessage(
        {
          type: "WEB3_WALLET_REQUEST",
          method: "connect",
        },
        "*"
      );

      const handleResponse = (event) => {
        if (
          event.data.type === "WEB3_WALLET_RESPONSE" &&
          event.data.method === "connect"
        ) {
          window.removeEventListener("message", handleResponse);
          if (event.data.success) {
            this.isConnected = true;
            this.account = event.data.account;
            window.dispatchEvent(
              new CustomEvent("wallet_connected", {
                detail: { account: this.account },
              })
            );
            resolve({ account: this.account });
          } else {
            reject(new Error(event.data.error || "Connection failed"));
          }
        }
      };

      window.addEventListener("message", handleResponse);

      // Timeout after 5 seconds
      setTimeout(() => {
        window.removeEventListener("message", handleResponse);
        reject(new Error("Connection request timed out"));
      }, 5000);
    });
  },

  // Send a transaction
  sendTransaction: async function (transaction) {
    return new Promise((resolve, reject) => {
      window.postMessage(
        {
          type: "WEB3_WALLET_REQUEST",
          method: "sendTransaction",
          params: { transaction },
        },
        "*"
      );

      const handleResponse = (event) => {
        if (
          event.data.type === "WEB3_WALLET_RESPONSE" &&
          event.data.method === "sendTransaction"
        ) {
          window.removeEventListener("message", handleResponse);
          if (event.data.success) {
            resolve({ txHash: event.data.txHash });
          } else {
            reject(new Error(event.data.error || "Transaction failed"));
          }
        }
      };

      window.addEventListener("message", handleResponse);

      // Timeout after 10 seconds
      setTimeout(() => {
        window.removeEventListener("message", handleResponse);
        reject(new Error("Transaction request timed out"));
      }, 10000);
    });
  },

  // Switch network
  switchNetwork: async function (networkId) {
    return new Promise((resolve, reject) => {
      window.postMessage(
        {
          type: "WEB3_WALLET_REQUEST",
          method: "switchNetwork",
          params: { networkId },
        },
        "*"
      );

      const handleResponse = (event) => {
        if (
          event.data.type === "WEB3_WALLET_RESPONSE" &&
          event.data.method === "switchNetwork"
        ) {
          window.removeEventListener("message", handleResponse);
          if (event.data.success) {
            this.chainId = networkId;
            window.dispatchEvent(
              new CustomEvent("network_changed", {
                detail: { networkId },
              })
            );
            resolve({ networkId });
          } else {
            reject(new Error(event.data.error || "Network switch failed"));
          }
        }
      };

      window.addEventListener("message", handleResponse);

      // Timeout after 5 seconds
      setTimeout(() => {
        window.removeEventListener("message", handleResponse);
        reject(new Error("Network switch request timed out"));
      }, 5000);
    });
  },

  // Sign message
  signMessage: async function (message) {
    return new Promise((resolve, reject) => {
      window.postMessage(
        {
          type: "WEB3_WALLET_REQUEST",
          method: "signMessage",
          params: { message },
        },
        "*"
      );

      const handleResponse = (event) => {
        if (
          event.data.type === "WEB3_WALLET_RESPONSE" &&
          event.data.method === "signMessage"
        ) {
          window.removeEventListener("message", handleResponse);
          if (event.data.success) {
            resolve({ signature: event.data.signature });
          } else {
            reject(new Error(event.data.error || "Message signing failed"));
          }
        }
      };

      window.addEventListener("message", handleResponse);

      // Timeout after 5 seconds
      setTimeout(() => {
        window.removeEventListener("message", handleResponse);
        reject(new Error("Message signing request timed out"));
      }, 5000);
    });
  },

  // Get current account
  getAccount: function () {
    return this.account;
  },

  // Get current chain ID
  getChainId: function () {
    return this.chainId;
  },

  // Check if connected
  isWalletConnected: function () {
    return this.isConnected;
  },
};

// Add a global property to help identify if the web3Wallet is injected
window.__WEB3_WALLET_INJECTED__ = true;

// Notify web page that the wallet is available
console.log(
  "web3Wallet: Object successfully injected into page",
  window.web3Wallet
);
window.dispatchEvent(new CustomEvent("wallet_initialized"));
