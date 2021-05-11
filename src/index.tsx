import React from "react";
import ReactDOM from "react-dom";
import { App } from "./App";
import { DetailProvider } from "./components/DetailContext";
import { DialogsProvider } from "./components/DialogsContext";
import { beginScenario } from "./engine/actions/phases";
import { playRandomlyUntilEnd } from "./engine/actions/utils";
import { passageThroughMirkwood, coreTactics } from "./engine/setup";
import { createInitState } from "./engine/state";

// const state = createInitState();
// const result = playRandomlyUntilEnd(
//   state,
//   beginScenario(passageThroughMirkwood, coreTactics)
// );
// console.log(result);

ReactDOM.render(
  <DialogsProvider>
    <DetailProvider>
      <App state={createInitState()} />
    </DetailProvider>
  </DialogsProvider>,
  document.getElementById("root")
);
