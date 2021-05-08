import { State } from "./state";
import { Engine } from "./types";
import { createView } from "./view";
import { filterCards } from "./filters";
import { getActionChange, sequence } from "./actions2";

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
            await ui.playerActions(result.choice.title);
            result.choice = undefined;
          }
        }
      }
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
