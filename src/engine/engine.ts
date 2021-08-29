import { State } from "./state";
import { sequence } from "./actions/control";
import { Action } from "./actions/types";
import { observable, runInAction } from "mobx";

export type Engine = {
  state: State;
  do: (action: Action) => Promise<void>;
};

export interface UI {
  chooseOne: <T>(
    title: string,
    items: Array<{ label: string; value: T; image?: string | undefined }>
  ) => Promise<T>;
  chooseMultiple: <T>(
    title: string,
    items: Array<{ label: string; value: T; image?: string | undefined }>
  ) => Promise<T[]>;
  playerActions: (title: string) => Promise<void>;
}

export function createEngine(ui: UI, init: State) {
  let state = observable(init);

  const engine: Engine = {
    get state() {
      return state;
    },

    do: async (action) => {
      let result = runInAction(() => action.do(state));

      while (true) {
        while (!result.choice) {
          if (result.next) {
            result = result.next.do(state);
          } else {
            return;
          }
        }

        if (result.choice) {
          if (result.choice.dialog) {
            const choosen = result.choice.multiple
              ? sequence(
                  ...(await ui.chooseMultiple(
                    result.choice.title,
                    result.choice.choices.map((c) => ({
                      label: c.label,
                      value: c.action,
                      image: c.image,
                    }))
                  ))
                )
              : await ui.chooseOne(
                  result.choice.title,
                  result.choice.choices.map((c) => ({
                    ...c,
                    value: c.action,
                  }))
                );

            const next = result.next;
            result = runInAction(() => choosen.do(state));
            if (next) {
              result.next = result.next ? sequence(result.next, next) : next;
            }
          } else {
            await ui.playerActions(result.choice.title);
            result.choice = undefined;
          }
        }
      }
    },
  };

  return engine;
}
