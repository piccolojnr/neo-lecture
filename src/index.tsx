import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { AdminProvider } from "./context/AdminContext";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <AdminProvider>
      <App />
    </AdminProvider>
  </React.StrictMode>
);
