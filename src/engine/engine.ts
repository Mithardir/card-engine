import { State } from "./state";
import { sequence } from "./actions/control";
import { getActionChange } from "./actions/utils";
import { Action } from "./actions/types";

export type Engine = {
  state: State;
  do: (action: Action) => Promise<void>;
};

export interface UI {
  chooseOne: <T>(title: string, items: Array<{ label: string; value: T; image?: string }>) => Promise<T>;
  chooseMultiple: <T>(title: string, items: Array<{ label: string; value: T; image?: string }>) => Promise<T[]>;
  playerActions: (title: string) => Promise<void>;
}

export async function processAction(init: State, action: Action, ui: UI, onStateChange: (state: State) => void) {
  const result = action.do(init);
  let state = result.state;
  onStateChange(state);

  if (result.choice && !result.choice.dialog) {
    await ui.playerActions(result.choice.title);
  }

  if (result.choice && result.choice.dialog) {
    const choosen = result.choice.multiple
      ? sequence(
          ...(await ui.chooseMultiple(
            result.choice.title,
            result.choice.choices
              .filter((c) => getActionChange(c.action, state) !== "none")
              .map((c) => ({
                label: c.label,
                value: c.action,
                image: c.image,
              }))
          ))
        )
      : await ui.chooseOne(
          result.choice.title,
          result.choice.choices
            .filter((c) => getActionChange(c.action, state) !== "none")
            .map((c) => ({
              ...c,
              value: c.action,
            }))
        );

    await processAction(state, choosen, ui, (s) => {
      state = s;
      onStateChange(s);
    });
  }

  if (result.next) {
    await processAction(state, result.next, ui, (s) => {
      state = s;
      onStateChange(s);
    });
  }
}

export function createEngine(ui: UI, init: State, onStateChange?: (state: State) => void) {
  let state = init;

  const engine: Engine = {
    get state() {
      return state;
    },
    do: async (action) => {
      return processAction(state, action, ui, (s) => {
        state = s;
        if (onStateChange) {
          onStateChange(s);
        }
      });
    },
  };

  return engine;
}
