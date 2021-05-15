import { CardFilter } from "../filters";
import { filterCards } from "../utils";
import { sequence } from "./control";
import { Action, CardAction } from "./types";
import { noChange } from "./utils";

export function chooseMultiple(
  title: string,
  choices: Array<{ label: string; image?: string; action: Action }>
): Action {
  return {
    print: `choose multiple [${choices.map((a) => a.action.print).join(", ")}]`,
    do: (state) => {
      if (choices.length === 0) {
        return sequence().do(state);
      }

      return {
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

export function chooseOne(title: string, choices: Array<{ label: string; image?: string; action: Action }>): Action {
  return {
    print: `choose one [${choices.map((c) => c.action.print).join(", ")}]`,
    do: (state) => {
      if (choices.length === 1) {
        return choices[0].action.do(state);
      }

      return {
        effect: "full",
        state: state,
        choice: {
          title,
          multiple: false,
          dialog: true,
          choices: choices.map((c) => ({ action: c.action, image: c.image, label: c.label })),
        },
        next: undefined,
      };
    },
  };
}

export function chooseOrder<T>(
  title: string,
  choices: Array<{ label: string; image?: string; action: Action; id: T }>,
  used: T[] = []
): Action {
  return {
    print: `choose order [${choices.map((c) => c.action.print).join(", ")}]`,
    do: (state) => {
      const filtered = choices.filter((c) => !used.includes(c.id));
      if (filtered.length === 0) {
        return {
          effect: "full",
          state,
          choice: undefined,
          next: undefined,
        };
      }

      if (filtered.length === 1) {
        return filtered[0].action.do(state);
      }

      return {
        effect: "full",
        state: state,
        choice: {
          title,
          multiple: false,
          dialog: true,
          choices: filtered.map((c) => ({
            action: sequence(c.action, chooseOrder(title, choices, [...used, c.id])),
            image: c.image,
            label: c.label,
          })),
        },
        next: undefined,
      };
    },
  };
}

export function chooseCardActionsOrder(title: string, filter: CardFilter, factory: CardAction): Action {
  return {
    print: `chooseCardActionsOrder(${filter("X" as any).print}, ${factory("X" as any).print})`,
    do: (s) => {
      const cards = filterCards(filter, s.view);
      const action = chooseOrder(
        title,
        cards.map((c) => ({ id: c.id, action: factory(c.id), label: c.props.name || "", image: c.props.image }))
      );

      return action.do(s);
    },
  };
}

export function chooseCardAction(title: string, filter: CardFilter, factory: CardAction): Action {
  return {
    print: `chooseCardAction(${factory("X" as any).print})`,
    do: (state) => {
      const cards = filterCards(filter, state.view);
      const action = chooseOne(
        title,
        cards.map((c) => ({ action: factory(c.id), label: c.props.name || "", image: c.props.image }))
      );

      if (cards.length === 0) {
        return noChange(state);
      }

      return action.do(state);
    },
  };
}

export function chooseCardsActions(title: string, filter: CardFilter, factory: CardAction): Action {
  return {
    print: `chooseCardsActions(${factory("X" as any).print})`,
    do: (state) => {
      const view = state.view;
      const cards = filterCards(filter, view);
      const choices = cards.map((card) => ({
        label: card.props.name || "",
        action: factory(card.id),
        image: card.props.image,
      }));
      const action = chooseMultiple(title, choices);
      return action.do(state);
    },
  };
}
