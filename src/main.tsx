import React from "react";
import ReactDOM from "react-dom/client";
import { CssBaseline } from "@mui/material";
import { GameView } from "./components/GameView";
import { DetailProvider } from "./components/DetailContext";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <CssBaseline />
    <DetailProvider>
      <GameView />
    </DetailProvider>
  </React.StrictMode>
);
