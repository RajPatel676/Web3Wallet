# Building the Chrome Extension

Follow these steps to build and load the Chrome extension:

## Prerequisites

- Node.js and npm installed on your system

## Steps

1. Install dependencies

```
cd chrome-extension
npm install
```

2. Build the extension

```
npm run build
```

3. Load the extension in Chrome:

   - Open Chrome browser
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in the top right corner)
   - Click "Load unpacked" button
   - Select the `build` folder that was created in the extension directory

4. The extension should now be installed. Click on the extension icon in the Chrome toolbar to see the "Hello World" message.

## Troubleshooting

- If you make changes to the code, you need to rebuild the extension and reload it in Chrome.
- To reload, go to `chrome://extensions/` and click the refresh icon on your extension card.
