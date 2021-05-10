import { State } from "./state";
import { sequence } from "./actions/control";
import { getActionChange } from "./actions/utils";
import { Action } from "./actions/types";
import { playerActions } from "./actions/game";

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
    // do: async (action) => {
    //   return processAction(state, action, ui, (s) => {
    //     state = s;
    //     if (onStateChange) {
    //       onStateChange(s);
    //     }
    //   });
    // },
    do: async (action) => {
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
            onStateChange(result.state);
          }
          state = result.state;

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
                  result.choice.choices
                    // eslint-disable-next-line no-loop-func
                    .filter((c) => getActionChange(c.action, state) !== "none")
                    .map((c) => ({
                      ...c,
                      value: c.action,
                    }))
                );

            const next = result.next;
            result = choosen.do(result.state);
            if (next) {
              result.next = result.next ? sequence(result.next, next) : next;
            }
          } else {
            console.log(playerActions(result.choice.title).do(engine.state));
            await ui.playerActions(result.choice.title);
            result.choice = undefined;
            result.state = state;
          }
        }
      }
    },
  };

  return engine;
}
