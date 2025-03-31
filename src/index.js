import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

// Add Buffer polyfill
window.Buffer = window.Buffer || require("buffer").Buffer;

// Add process polyfill
window.process = window.process || require("process");

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
