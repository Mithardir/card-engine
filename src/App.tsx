import React, { useContext, useMemo, useState } from "react";
import { createInitState, State } from "./engine/state";
import { createView } from "./engine/view";
import { GameShow, mergeAndResults, mergeOrResults, sequence } from "./components/GameShow";
import { gimli, legolas, thalin } from "./cards/sets/core/heroes";
import { DialogsContext, DialogsContextProps } from "./components/DialogsContext";
import { Dialog, DialogContent, DialogTitle, List, ListItem } from "@material-ui/core";
import { Action, CommandResult, Engine } from "./engine/types";

function getActionResult(action: Action, init: State): CommandResult {
  const cmds = action.commands(init);

  const results = cmds.map((c) => {
    const firstResult = c.first.result(init);
    const nextState = c.first.do(init);
    const nextAction = sequence(...c.next);
    const nextResult = getActionResult(nextAction, nextState);
    return mergeAndResults(firstResult, nextResult);
  });

  return mergeOrResults(results);
}

function createEngine(dialog: DialogsContextProps, init: State, onStateChange: (state: State) => void) {
  let state = init;

  const engine: Engine = {
    get state() {
      return state;
    },
    exec: (cmd) => {
      console.log("cmd", cmd.print);
      state = cmd.do(state);
      onStateChange(state);
    },
    do: async (action) => {
      console.log("act", action.print);
      await action.do(engine);
    },
    chooseNextAction: async (label, actions) => {
      const choices = actions.filter((a) => getActionResult(a.action, state) !== "none");

      if (choices.length === 0) {
        return;
      }

      // if (choices.length === 1) {
      //   engine.do(choices[0].action);
      //   return;
      // }

      const action = await dialog.openDialog<Action>((dp) => (
        <Dialog open={dp.open}>
          <DialogTitle>{label}</DialogTitle>
          <DialogContent>
            <List>
              {choices.map((a) => (
                <ListItem
                  button
                  key={a.label}
                  onClick={() => {
                    dp.onSubmit(a.action);
                  }}
                  style={{ width: "auto" }}
                >
                  {a.label}
                </ListItem>
              ))}
            </List>
          </DialogContent>
        </Dialog>
      ));

      engine.do(action);
    },
  };

  return engine;
}

function App() {
  const [state, setState] = useState(createInitState({ cards: [gimli, legolas] }, { cards: [thalin] }));
  const view = createView(state);

  const dialog = useContext(DialogsContext);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const engine = useMemo(() => createEngine(dialog, state, setState), []);

  return (
    <>
      <GameShow
        view={view}
        onAction={async (action) => {
          engine.do(action);
        }}
      />
    </>
  );
}

export default App;
