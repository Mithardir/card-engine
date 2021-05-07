import { State } from "./state";
import { Action, CommandResult, Engine } from "./types";
import { produce, produceWithPatches } from "immer";
import { sequence } from "./actions";
import { mergeAndResults, mergeOrResults } from "./utils";
import { createView } from "./view";
import { filterCards } from "./filters";
import { action, getActionChange, sequence2 } from "./actions2";
import { isWhileStatement } from "typescript";

export interface UI {
  chooseOne: <T>(title: string, items: Array<{ label: string; value: T; image?: string }>) => Promise<T>;
  chooseMultiple: <T>(title: string, items: Array<{ label: string; value: T; image?: string }>) => Promise<T[]>;
  playerActions: (title: string) => Promise<void>;
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
    do2: async (action) => {
      //debugger;
      let result = action.do(state);

      while (true) {
        while (!result.choice) {
          if (result.next) {
            result = result.next.do(result.state);
          } else {
            state = result.state;
            if (onStateChange) {
              onStateChange(state);
            }
            return;
          }
        }

        if (result.choice) {
          if (onStateChange && state !== result.state) {
            onStateChange(state);
          }
          state = result.state;

          const choosen = await ui.chooseOne(
            result.choice.title,
            result.choice.choices
              .filter((c) => getActionChange(c.action, state) !== "none")
              .map((c) => ({
                ...c,
                value: c.action,
              }))
          );

          const next = result.next;
          result = choosen.do(result.state);
          if (next) {
            result.next = result.next ? sequence2([next, result.next]) : next;
          }
        }
      }
    },
    chooseNextAction: async (label, actions) => {
      //console.log(actions);
      //console.log(actions.map((a) => getActionResult(a.value, state)));
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
    chooseNextActions: async (label, actions) => {
      // console.log(actions.map((a) => getActionResult(a.value, state)));
      const choices = actions.filter((a) => getActionResult(a.value, state) !== "none");

      if (choices.length === 0) {
        return;
      }

      const choosen = await ui.chooseMultiple<Action>(label, choices);

      await engine.do(sequence(...choosen));
    },
    chooseCards: async (title, filter) => {
      const view = createView(state);
      const cards = filterCards(filter, view);
      const selected = await ui.chooseMultiple(
        title,
        cards.map((card) => ({
          label: card.props.name || "",
          value: card.id,
          image: card.props.image,
        }))
      );

      return selected;
    },
    playerActions: async (title) => {
      await ui.playerActions(title);
    },
    chooseOne: (title, options) => {
      throw new Error();
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
