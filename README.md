# Web3 Wallet Extension

A lightweight Chrome extension for managing cryptocurrency wallets on test networks.

## Features

- Create and manage multiple Ethereum and Polygon wallets
- Secure key management with mnemonic seed phrases
- Import existing wallets using seed phrases
- Support for multiple test networks (Sepolia, Amoy)
- Send and receive transactions
- Track transaction history
- Simple and intuitive UI
- Integration with any React application

## Setup & Installation

1. Clone this repository
2. Install dependencies:
   ```
   cd chrome-extension
   npm install
   ```
3. Build the extension:
   ```
   npm run build
   ```
4. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" by toggling the switch in the top right
   - Click "Load unpacked" and select the `build` folder from this project

## Using the Wallet

### Initial Setup

When you first install the extension, you'll be presented with two options:

- **Create New Wallet**: Generate a completely new wallet with a new seed phrase
- **Import Existing Wallet**: Import a wallet using an existing seed phrase

#### Creating a New Wallet

1. Select "Create New Wallet"
2. A new seed phrase (12 words) will be displayed
3. **IMPORTANT**: Back up this seed phrase securely. It's the only way to recover your wallet!
4. Download your seed phrase and confirm that you've backed it up
5. Verify your seed phrase by entering the requested words
6. Your wallet will be created and you'll be taken to the dashboard

#### Importing a Wallet

1. Select "Import Existing Wallet"
2. Enter a name for your wallet (optional)
3. Enter your 12 or 24-word seed phrase (separated by spaces)
4. Click "Import Wallet"
5. Your wallet will be imported and you'll be taken to the dashboard

### Using the Dashboard

- **Assets Tab**: View your account balance
- **Send Tab**: Send transactions to other addresses
- **Activity Tab**: View your transaction history

### Managing Accounts

- Click on your account in the top section to view and manage accounts
- Create additional accounts by clicking "Create New Account"
- Switch between accounts by clicking on them in the dropdown

### Network Selection

- Select different networks using the dropdown in the top-right corner
- Supported networks: Ethereum Sepolia, Polygon Amoy

### Resetting the Wallet

If you need to reset the wallet completely:

1. Click on your account to open the dropdown
2. Click "Reset Wallet" at the bottom
3. Confirm that you want to reset the wallet
4. **CAUTION**: This will remove all accounts and data!

## Development

### Project Structure

- `src/components/`: UI components
- `src/context/`: State management using React Context
- `src/web3/`: Web3 integration code
- `src/utils/`: Utility functions
- `public/`: Extension manifest and background scripts

### Testing Your Changes

After making changes, rebuild the extension:

```
npm run build
```

Then reload the extension in Chrome:

1. Go to `chrome://extensions/`
2. Find the Web3 Wallet extension
3. Click the refresh icon

## React Integration

For developers who want to integrate this wallet with their React applications, see the [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for detailed instructions.

## Troubleshooting

If you encounter any issues, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for help.

## Security Considerations

- This wallet is intended for educational and testing purposes on test networks
- Never use this wallet with real funds on mainnet
- Always keep your seed phrase secure and never share it
- The extension stores wallet information in Chrome's local storage, which is not encrypted
