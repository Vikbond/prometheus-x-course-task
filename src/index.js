import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import { BooksProvider } from "./context/BooksContext";
import "./styles.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <HashRouter>
      <BooksProvider>
        <App />
      </BooksProvider>
    </HashRouter>
  </React.StrictMode>,
);
