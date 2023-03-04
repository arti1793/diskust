import React, { Context } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";
import { Store } from "./state/index";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Store>
      <App />
    </Store>
  </React.StrictMode>
);
