import React from "react";

const ErrorDisplay = ({ error }) => {
  return (
    <div className="error-display">
      <h3>Error Occurred</h3>
      <div className="error-message">{error}</div>
      <div className="error-help">
        <h4>Troubleshooting Steps:</h4>
        <ol>
          <li>Refresh the page and try again</li>
          <li>Check if you have the latest version of the extension</li>
          <li>Try reinstalling the extension</li>
          <li>If the error persists, report it to the developer</li>
        </ol>
      </div>
      <div className="technical-info">
        <h4>Technical Information:</h4>
        <p>
          Chrome extensions have limitations regarding Node.js-specific modules.
          This error might be due to missing polyfills for browser environment.
        </p>
        <p>
          Try running: <code>npm install buffer process</code> and rebuild the
          extension.
        </p>
      </div>
      <button
        className="refresh-button"
        onClick={() => window.location.reload()}
      >
        Refresh Page
      </button>
    </div>
  );
};

export default ErrorDisplay;
