import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { DialogsProvider } from "./components/DialogsContext";
import { DetailProvider } from "./components/DetailContext";

ReactDOM.render(
  <DialogsProvider>
    <DetailProvider>
      <App />
    </DetailProvider>
  </DialogsProvider>,
  document.getElementById("root")
);
