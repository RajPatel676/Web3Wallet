# Web3 Wallet Extension Integration Guide

This guide explains how to integrate the Web3 Wallet extension with your React application.

## Table of Contents

1. [Requirements](#requirements)
2. [Installation](#installation)
3. [Quick Start](#quick-start)
4. [React Components](#react-components)
5. [Advanced Usage](#advanced-usage)
6. [Handling Transactions](#handling-transactions)
7. [Network Support](#network-support)
8. [Error Handling](#error-handling)

## Requirements

- React 16.8+ (for hooks support)
- Web3 Wallet extension installed in the user's browser

## Installation

To use the Web3 Wallet in your React application, you need to include our connector library:

```bash
npm install @web3wallet/react
```

Or via CDN:

```html
<script src="https://cdn.example.com/web3wallet-react.js"></script>
```

## Quick Start

Here's a simple example of how to integrate the wallet:

```jsx
import React from "react";
import {
  Web3WalletProvider,
  ConnectButton,
  useWeb3Wallet,
} from "@web3wallet/react";

// Wrap your app with the provider
function App() {
  return (
    <Web3WalletProvider>
      <YourApp />
    </Web3WalletProvider>
  );
}

// In your components
function YourApp() {
  const { isConnected, account } = useWeb3Wallet();

  return (
    <div>
      <ConnectButton
        onSuccess={(account) => console.log(`Connected: ${account}`)}
        onError={(error) => console.error(`Connection error: ${error}`)}
      />

      {isConnected && (
        <div>
          <p>Connected Account: {account}</p>
          {/* Your app content */}
        </div>
      )}
    </div>
  );
}
```

## React Components

The Web3 Wallet React package provides several components to make integration easy:

### Web3WalletProvider

The provider component that makes wallet functionality available throughout your app:

```jsx
import { Web3WalletProvider } from "@web3wallet/react";

function App() {
  return <Web3WalletProvider>{/* Your app components */}</Web3WalletProvider>;
}
```

### useWeb3Wallet Hook

A React hook that provides access to wallet state and methods:

```jsx
import { useWeb3Wallet } from "@web3wallet/react";

function WalletStatus() {
  const {
    isAvailable, // Whether the wallet extension is installed
    isConnected, // Whether the wallet is connected
    account, // The connected account address
    chainId, // The current network chainId
    error, // Any error that occurred
    connect, // Function to connect to the wallet
    sendTransaction, // Function to send a transaction
    switchNetwork, // Function to switch networks
  } = useWeb3Wallet();

  return (
    <div>
      {isConnected ? (
        <p>Connected to: {account}</p>
      ) : (
        <button onClick={connect}>Connect</button>
      )}
    </div>
  );
}
```

### ConnectButton

A pre-styled button component for connecting to the wallet:

```jsx
import { ConnectButton } from "@web3wallet/react";

function Header() {
  return (
    <ConnectButton
      connectText="Connect Wallet" // Text to show when not connected
      connectedText="Connected" // Text to show when connected
      className="custom-button-class" // Additional CSS class
      style={{ borderRadius: "4px" }} // Additional inline styles
      onSuccess={(account) => {
        /* handle success */
      }}
      onError={(error) => {
        /* handle error */
      }}
    />
  );
}
```

### NetworkSelector

A dropdown component for switching networks:

```jsx
import { NetworkSelector } from "@web3wallet/react";

function NetworkOptions() {
  return (
    <NetworkSelector
      networks={{
        ETHEREUM_SEPOLIA: "Sepolia Testnet",
        POLYGON_AMOY: "Polygon Amoy",
      }}
      onChange={(networkId) => console.log(`Switched to ${networkId}`)}
      className="custom-select-class"
      style={{ width: "200px" }}
    />
  );
}
```

## Advanced Usage

### Sending Transactions

To send a transaction, use the `sendTransaction` method from the hook:

```jsx
import { useWeb3Wallet } from "@web3wallet/react";

function SendForm() {
  const { sendTransaction } = useWeb3Wallet();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");

  const handleSend = async () => {
    const result = await sendTransaction(recipient, amount);

    if (result.success) {
      setTxHash(result.txHash);
    } else {
      setError(result.error);
    }
  };

  return (
    <div>
      <input
        placeholder="Recipient address"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
      />
      <input
        placeholder="Amount"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={handleSend}>Send</button>

      {txHash && <p>Transaction sent: {txHash}</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
}
```

### Switching Networks

To switch networks, use the `switchNetwork` method:

```jsx
import { useWeb3Wallet } from "@web3wallet/react";

function NetworkSwitch() {
  const { switchNetwork, chainId } = useWeb3Wallet();

  const handleSwitchToSepolia = async () => {
    await switchNetwork("ETHEREUM_SEPOLIA");
  };

  const handleSwitchToAmoy = async () => {
    await switchNetwork("POLYGON_AMOY");
  };

  return (
    <div>
      <p>Current network: {chainId}</p>
      <button onClick={handleSwitchToSepolia}>Switch to Sepolia</button>
      <button onClick={handleSwitchToAmoy}>Switch to Polygon Amoy</button>
    </div>
  );
}
```

## Network Support

The Web3 Wallet currently supports the following networks:

- Ethereum Sepolia Testnet (chainId: 0xaa36a7)
- Polygon Amoy Testnet (chainId: 0x13881)

## Error Handling

All methods (`connect`, `sendTransaction`, `switchNetwork`) return a promise that resolves to an object with the following structure:

```js
{
  success: true/false,
  error: "Error message if success is false",
  // Additional properties based on the method
  // For connect: account
  // For sendTransaction: txHash
  // For switchNetwork: networkId
}
```

Example error handling:

```jsx
const handleConnect = async () => {
  const result = await connect();

  if (result.success) {
    console.log(`Connected to account: ${result.account}`);
  } else {
    console.error(`Connection failed: ${result.error}`);
  }
};
```

## Testing Without Extension

For development environments where you can't install the extension, you can use our mock provider:

```jsx
import { MockWeb3WalletProvider } from "@web3wallet/react/mock";

function App() {
  return (
    <MockWeb3WalletProvider>
      <YourApp />
    </MockWeb3WalletProvider>
  );
}
```

---

For additional help or issues, please visit our [GitHub repository](https://github.com/web3wallet/web3wallet) or contact our support team.
