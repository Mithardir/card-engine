import React, { createContext, useContext, useMemo, useState } from "react";
import { createInitState, State } from "./engine/state";
import { createView } from "./engine/view";
import { GameShow, mergeAndResults, mergeOrResults, sequence } from "./components/GameShow";
import { gimli, legolas, thalin } from "./cards/sets/core/heroes";
import { DialogsContext, DialogsContextProps } from "./components/DialogsContext";
import { CssBaseline, Dialog, DialogContent, DialogTitle, List, ListItem } from "@material-ui/core";
import { Action, CommandResult, Engine } from "./engine/types";
import { produce } from "immer";

export const EngineContext = createContext<Engine>(undefined as any);

export const EngineProvider = (props: React.PropsWithChildren<{ engine: Engine }>) => {
  return <EngineContext.Provider value={props.engine}>{props.children}</EngineContext.Provider>;
};

export function getActionResult(action: Action, init: State): CommandResult {
  const cmds = action.commands(init);

  const results = cmds.map((c) => {
    const firstResult = c.first.result(init);
    if (c.next.length === 0) {
      return firstResult;
    }
    const nextState = produce(init, (draft) => c.first.do(draft));
    const nextAction = sequence(...c.next);
    const nextResult = getActionResult(nextAction, nextState);
    return mergeAndResults(firstResult, nextResult);
  });

  return mergeOrResults(results);
}

export interface UI {
  chooseOne: <T>(title: string, items: Array<{ label: string; value: T }>) => Promise<T>;
}

export const reactUI: (dialog: DialogsContextProps) => UI = (dialog) => {
  return {
    chooseOne: async (title, items) => {
      return await dialog.openDialog((dp) => (
        <Dialog open={dp.open}>
          <DialogTitle>{title}</DialogTitle>
          <DialogContent>
            <List>
              {items.map((a) => (
                <ListItem
                  button
                  key={a.label}
                  onClick={() => {
                    dp.onSubmit(a.value);
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
    },
  };
};

export function createEngine(ui: UI, init: State, onStateChange?: (state: State) => void) {
  let state = init;

  const engine: Engine = {
    get state() {
      return state;
    },
    exec: (cmd) => {
      console.log("cmd", cmd.print);
      state = produce(state, (draft) => cmd.do(draft));
      if (onStateChange) {
        onStateChange(state);
      }
    },
    do: async (action) => {
      console.log("act", action.print);
      await action.do(engine);
    },
    chooseNextAction: async (label, actions) => {
      const choices = actions.filter((a) => getActionResult(a.value, state) !== "none");

      if (choices.length === 0) {
        return;
      }

      // if (choices.length === 1) {
      //   engine.do(choices[0].action);
      //   return;
      // }

      const action = await ui.chooseOne<Action>(label, choices);

      await engine.do(action);
    },
  };

  return engine;
}

function App() {
  const [state, setState] = useState(createInitState({ cards: [gimli, legolas] }, { cards: [thalin] }));
  const view = createView(state);

  const dialog = useContext(DialogsContext);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const engine = useMemo(() => createEngine(reactUI(dialog), state, setState), []);

  return (
    <>
      <EngineProvider engine={engine}>
        <CssBaseline />
        <GameShow
          view={view}
          onAction={async (action) => {
            engine.do(action);
          }}
        />
      </EngineProvider>
    </>
  );
}

export default App;
