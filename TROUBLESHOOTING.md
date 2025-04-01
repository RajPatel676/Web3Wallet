# Web3 Wallet Extension - Troubleshooting Guide

## Common Issues and Solutions

### "Cannot destructure property 'activeAccount'" Error

If you see errors like:

```
TypeError: Cannot destructure property 'activeAccount' of '(0 , e.useContext)(...)' as it is undefined.
```

This is usually caused by compatibility issues with Node.js libraries in the Chrome extension environment. The extension automatically uses a simplified wallet implementation to fix this, but if you're still experiencing issues:

1. **Force Simplified Mode**:

   - Open the extension popup and click the "Refresh Page" button
   - The extension should automatically use simplified mode

2. **Clear Extension Storage**:

   - Right-click on the extension icon
   - Select "Options" or "Extension options"
   - Click on "Clear storage" or similar option in the browser's extension settings
   - Reload the extension

3. **Reinstall the Extension**:
   - Go to `chrome://extensions/`
   - Remove the extension
   - Load it again using "Load unpacked" and select the `build` folder

### "Buffer is not defined" Error

If you see an error referencing Buffer:

1. The extension should automatically use a simplified implementation that doesn't rely on Buffer
2. If the error persists, install the necessary polyfills:
   ```
   cd chrome-extension
   npm install --save buffer process
   npm run build
   ```
3. Reload the extension in Chrome

### Loading Stuck at "Loading wallet..."

If the extension is stuck loading:

1. Open the Chrome DevTools console (right-click, Inspect, Console tab)
2. Check for any error messages
3. Try accessing with the debug URL parameter:
   - Append `?debug=true` to the extension URL
   - This will show detailed diagnostic information

### Transaction Issues

If you're having trouble with transactions:

1. Ensure you're using the simplified wallet mode (you'll see a yellow banner at the top)
2. Remember that in simplified mode, transactions are simulated and don't affect real blockchains
3. Try creating a new account if you're experiencing persistent issues

## Contacting Support

If you continue to experience issues, please:

1. Take a screenshot of any error messages
2. Note which browser and version you're using
3. Describe the steps that led to the error
4. Submit these details to the extension developer

---

## For Developers

If you're integrating with this wallet extension:

1. Always check if the wallet is available before attempting to use it
2. Handle cases where the context might be undefined
3. Use the simplified wallet interface for better compatibility across environments

Example defensive code:

```javascript
import { useContext } from "react";
import { SimplifiedWalletContext, WalletContext } from "web3-wallet-extension";

function YourComponent() {
  // Try both contexts and use what's available
  const simplifiedContext = useContext(SimplifiedWalletContext);
  const regularContext = useContext(WalletContext);

  // Use whichever context is available
  const walletContext = simplifiedContext || regularContext || {};

  // Extract values with fallbacks
  const { accounts = {}, activeAccount = null } = walletContext;

  // Always check before using
  if (!activeAccount) {
    return <div>Wallet not connected or initialized</div>;
  }

  return <div>Account: {activeAccount.address}</div>;
}
```
