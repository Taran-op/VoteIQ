/**
 * @fileoverview VoteIQ Application Entry Point
 * @description Bootstraps the React application with StrictMode for development warnings.
 */

import React from "react";
import ReactDOM from "react-dom/client";
import VoteIQ from "./voteiq.jsx";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root not found in the document.");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <VoteIQ />
  </React.StrictMode>
);
