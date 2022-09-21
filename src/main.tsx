import React from "react";
import ReactDOM from "react-dom/client";
import { CssBaseline } from "@mui/material";
import { advanceToChoiceState, GameView } from "./components/GameView";
import { DetailProvider } from "./components/DetailContext";
import { beginScenario } from "./engine/actions/round";
import { passageThroughMirkwood, coreTactics } from "./engine/setup";
import { State } from "./types/state";
import { StateProvider } from "./components/StateContext";
import { setAutoFreeze } from "immer";

setAutoFreeze(false);

const initState: State = {
  phase: "setup",
  effects: [],
  players: {},
  cards: [],
  zones: {
    activeLocation: { cards: [], stack: false },
    discardPile: { cards: [], stack: true },
    encounterDeck: { cards: [], stack: true },
    questDeck: { cards: [], stack: true },
    stagingArea: { cards: [], stack: false },
    victoryDisplay: { cards: [], stack: true },
  },
  next: [beginScenario(passageThroughMirkwood, coreTactics)],
  triggers: { end_of_phase: [], end_of_round: [] },
  flags: {},
};

console.log(initState.next[0].print);

advanceToChoiceState(initState);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <CssBaseline />
    <DetailProvider>
      <StateProvider init={initState}>
        <GameView />
      </StateProvider>
    </DetailProvider>
  </React.StrictMode>
);
