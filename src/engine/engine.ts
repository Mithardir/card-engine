import { State } from "./state";
import { Action, CommandResult, Engine } from "./types";
import { produce } from "immer";
import { sequence, mergeAndResults, mergeOrResults } from "../components/GameShow";

export interface UI {
  chooseOne: <T>(title: string, items: Array<{ label: string; value: T }>) => Promise<T>;
}

export function createEngine(ui: UI, init: State, onStateChange?: (state: State) => void) {
  let state = init;

  const engine: Engine = {
    get state() {
      return state;
    },
    exec: (cmd) => {
      console.log("cmd", cmd.print);
      state = produce(state, (draft) => {
        cmd.do(draft);
        draft.version++;
      });
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
