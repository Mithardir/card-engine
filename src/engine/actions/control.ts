import produce from "immer";
import { Exp } from "../exps";
import { Filter } from "../filters";
import { State, CardId } from "../state";
import { filterCards } from "../utils";
import { createView } from "../view";
import { ActionEffect, Action, CardAction } from "./types";
import { mergeEffect, getActionChange } from "./utils";

export function action(title: string, update: (state: State) => ActionEffect): Action {
  return {
    print: title,
    do: (state) => {
      let change: ActionEffect = "none";
      const newState = produce(state, (draft) => {
        change = update(draft);
      });
      return {
        effect: change,
        state: newState,
        choice: undefined,
        next: undefined,
      };
    },
  };
}

export function sequence(...actions: Action[]): Action {
  return {
    print: `sequence: ${actions.map((a) => a.print).join(",")}`,
    do: (state) => {
      if (actions.length === 0) {
        return {
          effect: "none",
          choice: undefined,
          next: undefined,
          state,
        };
      }

      const result = actions[0].do(state);

      if (actions.length === 1) {
        return result;
      } else {
        return {
          effect: result.effect,
          state: result.state,
          choice: result.choice
            ? {
                ...result.choice,
                choices: result.choice.choices.map((c) => ({ ...c, action: c.action })),
              }
            : undefined,
          next: result.next ? sequence(result.next, ...actions.slice(1)) : sequence(...actions.slice(1)),
        };
      }
    },
  };
}

export function whileDo(exp: Exp<boolean>, action: Action): Action {
  return {
    print: `while (${exp.print}) do {${action.print}}`,
    do: (state) => {
      if (exp.eval(createView(state))) {
        const result = action.do(state);

        return {
          state: result.state,
          next: result.next ? sequence(result.next, whileDo(exp, action)) : whileDo(exp, action),
          effect: result.effect,
          choice: result.choice,
        };
      } else {
        return {
          effect: "none",
          choice: undefined,
          next: undefined,
          state,
        };
      }
    },
  };
}

export function chooseSome(title: string, choices: Array<{ label: string; image?: string; action: Action }>): Action {
  return {
    print: `choose one [${choices.map((a) => a.action.print).join(", ")}]`,
    do: (state) => {
      return {
        effect: mergeEffect("or", ...choices.map((c) => getActionChange(c.action, state))),
        state: state,
        choice: {
          title,
          multiple: true,
          dialog: true,
          choices: choices.map((c) => ({ action: c.action, image: c.image, label: c.label })),
        },
        next: undefined,
      };
    },
  };
}

export function chooseOne(title: string, actions: Action[]): Action {
  return {
    print: `choose one [${actions.map((a) => a.print).join(", ")}]`,
    do: (state) => {
      return {
        effect: mergeEffect("or", ...actions.map((a) => getActionChange(a, state))),
        state: state,
        choice: {
          title,
          multiple: false,
          dialog: true,
          choices: actions.map((a) => ({ action: a, image: "", label: a.print })),
        },
        next: undefined,
      };
    },
  };
}

export function chooseCardActionOrder(
  title: string,
  filter: Filter<CardId>,
  action: CardAction,
  used: CardId[] = []
): Action {
  return {
    print: `choose card order for cards ${filter(0).print} and action ${action(0).print}`,
    do: (s) => {
      const cards = filterCards(filter, createView(s)).filter((c) => !used.includes(c.id));
      if (cards.length === 0) {
        return sequence().do(s);
      } else {
        return {
          state: s,
          effect: "full",
          choice: {
            title,
            multiple: false,
            dialog: true,
            choices: cards.map((c) => ({
              label: c.props.name || "",
              action: sequence(action(c.id), chooseCardActionOrder(title, filter, action, [...used, c.id])),
              image: c.props.image,
            })),
          },
          next: undefined,
        };
      }
    },
  };
}

export function chooseCardForAction(title: string, filter: Filter<CardId>, cardAction: CardAction): Action {
  return {
    print: `choose card for action ${cardAction(0).print}`,
    do: (state) => {
      const cards = filterCards(filter, createView(state));
      const action = chooseOne(
        title,
        cards.map((c) => cardAction(c.id))
      );

      if (cards.length === 0) {
        return sequence().do(state);
      }

      return action.do(state);
    },
  };
}

export function bind<T>(exp: Exp<T>, factory: (v: T) => Action): Action {
  return {
    // TODO x
    print: factory("x" as any).print,
    do: (state) => {
      const value = exp.eval(createView(state));
      const action = factory(value);
      return action.do(state);
    },
  };
}

export function chooseCardsForAction(title: string, filter: Filter<CardId>, factory: (id: CardId) => Action): Action {
  return {
    print: `choose cards for action: [${factory(0).print}]`,
    do: (state) => {
      const view = createView(state);
      const cards = filterCards(filter, view);
      const choices = cards.map((card) => ({
        label: card.props.name || "",
        action: factory(card.id),
        image: card.props.image,
      }));
      const action = chooseSome(title, choices);
      return action.do(state);
    },
  };
}

export function repeat(amount: number, action: Action): Action {
  return {
    print: `repeat ${amount}x: [${action.print}]`,
    do: (s) => {
      return sequence(...Array.from(new Array(amount)).map((_) => action)).do(s);
    },
  };
}
