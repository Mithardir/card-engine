import { CssBaseline } from "@mui/material";
import React from "react";
import { passageThroughMirkwood } from "./cards/core/scenarios";
import { DetailProvider } from "./components/DetailContext";
import { GameView } from "./components/GameView";
import { StateProvider } from "./components/StateContext";
import { coreTactics } from "./decks/coreTactics";
import { advanceToChoiceState, createState } from "./engine/basic";
import { beginScenario } from "./factories/actions";

const state = createState(beginScenario(passageThroughMirkwood, coreTactics));

advanceToChoiceState(state);

console.log(state);

export const App = () => {
  return (
    <React.StrictMode>
      <CssBaseline />
      <DetailProvider>
        <StateProvider init={state}>
          <GameView />
        </StateProvider>
      </DetailProvider>
    </React.StrictMode>
  );
};
