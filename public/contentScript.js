// Content script for the wallet extension
// This script handles communication between the page and the extension

console.log("web3Wallet: Content script starting");

// Create and inject the web3Wallet object
const web3Wallet = {
  isConnected: false,
  account: null,
  chainId: null,

  connect: async () => {
    return new Promise((resolve, reject) => {
      window.postMessage(
        { type: "WEB3_WALLET_REQUEST", method: "connect" },
        "*"
      );

      const messageHandler = (event) => {
        if (event.source !== window) return;
        if (
          event.data.type === "WEB3_WALLET_RESPONSE" &&
          event.data.method === "connect"
        ) {
          window.removeEventListener("message", messageHandler);
          if (event.data.success) {
            web3Wallet.isConnected = true;
            web3Wallet.account = event.data.account;
            resolve({ account: event.data.account });
          } else {
            reject(new Error(event.data.error));
          }
        }
      };

      window.addEventListener("message", messageHandler);
    });
  },

  sendTransaction: async (transaction) => {
    return new Promise((resolve, reject) => {
      window.postMessage(
        {
          type: "WEB3_WALLET_REQUEST",
          method: "sendTransaction",
          params: { transaction },
        },
        "*"
      );

      const messageHandler = (event) => {
        if (event.source !== window) return;
        if (
          event.data.type === "WEB3_WALLET_RESPONSE" &&
          event.data.method === "sendTransaction"
        ) {
          window.removeEventListener("message", messageHandler);
          if (event.data.success) {
            resolve(event.data.txHash);
          } else {
            reject(new Error(event.data.error));
          }
        }
      };

      window.addEventListener("message", messageHandler);
    });
  },

  switchNetwork: async (networkId) => {
    return new Promise((resolve, reject) => {
      window.postMessage(
        {
          type: "WEB3_WALLET_REQUEST",
          method: "switchNetwork",
          params: { networkId },
        },
        "*"
      );

      const messageHandler = (event) => {
        if (event.source !== window) return;
        if (
          event.data.type === "WEB3_WALLET_RESPONSE" &&
          event.data.method === "switchNetwork"
        ) {
          window.removeEventListener("message", messageHandler);
          if (event.data.success) {
            web3Wallet.chainId = networkId;
            resolve();
          } else {
            reject(new Error(event.data.error));
          }
        }
      };

      window.addEventListener("message", messageHandler);
    });
  },

  disconnect: async () => {
    web3Wallet.isConnected = false;
    web3Wallet.account = null;
    web3Wallet.chainId = null;
  },

  getChainId: async () => {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type: "GET_CHAIN_ID" }, (response) => {
        if (response && response.success) {
          web3Wallet.chainId = response.chainId;
          resolve(response.chainId);
        } else {
          reject(new Error("Failed to get chain ID"));
        }
      });
    });
  },
};

// Inject the web3Wallet object into the window
window.web3Wallet = web3Wallet;
console.log("web3Wallet: Injected web3Wallet object into window");

// Listen for messages from the page
window.addEventListener("message", (event) => {
  if (event.source !== window) return;

  if (event.data.type === "WEB3_WALLET_REQUEST") {
    const { method, params } = event.data;

    switch (method) {
      case "connect":
        chrome.runtime.sendMessage({ type: "CONNECT_WALLET" }, (response) => {
          if (response && response.success) {
            // Get accounts
            chrome.runtime.sendMessage(
              { type: "GET_ACCOUNTS" },
              (accountResponse) => {
                if (
                  accountResponse &&
                  accountResponse.success &&
                  Object.keys(accountResponse.accounts).length > 0
                ) {
                  const accountArray = Object.values(accountResponse.accounts);
                  const account = accountArray[0].address;

                  window.postMessage(
                    {
                      type: "WEB3_WALLET_RESPONSE",
                      method: "connect",
                      success: true,
                      account,
                    },
                    "*"
                  );
                } else {
                  window.postMessage(
                    {
                      type: "WEB3_WALLET_RESPONSE",
                      method: "connect",
                      success: false,
                      error: "No accounts available",
                    },
                    "*"
                  );
                }
              }
            );
          } else {
            window.postMessage(
              {
                type: "WEB3_WALLET_RESPONSE",
                method: "connect",
                success: false,
                error: "Connection failed",
              },
              "*"
            );
          }
        });
        break;

      case "sendTransaction":
        chrome.runtime.sendMessage(
          {
            type: "SIGN_TRANSACTION",
            transaction: params.transaction,
          },
          (response) => {
            if (response && response.success) {
              window.postMessage(
                {
                  type: "WEB3_WALLET_RESPONSE",
                  method: "sendTransaction",
                  success: true,
                  txHash: response.txHash,
                },
                "*"
              );
            } else {
              window.postMessage(
                {
                  type: "WEB3_WALLET_RESPONSE",
                  method: "sendTransaction",
                  success: false,
                  error: "Transaction request failed",
                },
                "*"
              );
            }
          }
        );
        break;

      case "switchNetwork":
        chrome.runtime.sendMessage(
          {
            type: "SWITCH_NETWORK",
            network: params.networkId,
          },
          (response) => {
            if (response && response.success) {
              window.postMessage(
                {
                  type: "WEB3_WALLET_RESPONSE",
                  method: "switchNetwork",
                  success: true,
                  networkId: params.networkId,
                },
                "*"
              );
            } else {
              window.postMessage(
                {
                  type: "WEB3_WALLET_RESPONSE",
                  method: "switchNetwork",
                  success: false,
                  error: "Network switch failed",
                },
                "*"
              );
            }
          }
        );
        break;

      case "signMessage":
        chrome.runtime.sendMessage(
          {
            type: "SIGN_MESSAGE",
            message: params.message,
          },
          (response) => {
            if (response && response.success) {
              window.postMessage(
                {
                  type: "WEB3_WALLET_RESPONSE",
                  method: "signMessage",
                  success: true,
                  signature: response.signature,
                },
                "*"
              );
            } else {
              window.postMessage(
                {
                  type: "WEB3_WALLET_RESPONSE",
                  method: "signMessage",
                  success: false,
                  error: "Message signing failed",
                },
                "*"
              );
            }
          }
        );
        break;
    }
  }
});

console.log(
  "web3Wallet: Content script initialized and listening for messages"
);
