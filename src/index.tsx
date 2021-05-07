import React from "react";
import ReactDOM from "react-dom";
import { App } from "./App";
import { DetailProvider } from "./components/DetailContext";
import { DialogsProvider } from "./components/DialogsContext";

ReactDOM.render(
  <DialogsProvider>
    <DetailProvider>
      <App />
    </DetailProvider>
  </DialogsProvider>,
  document.getElementById("root")
);
