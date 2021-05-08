import { Filter } from "../filters";
import { CardId } from "../state";
import { filterCards } from "../utils";
import { createView } from "../view";
import { sequence } from "./control";
import { Action, CardAction } from "./types";
import { mergeEffect, getActionChange } from "./utils";

export function chooseMultiple(
  title: string,
  choices: Array<{ label: string; image?: string; action: Action }>
): Action {
  return {
    print: `choose multiple [${choices.map((a) => a.action.print).join(", ")}]`,
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

export function chooseOne(title: string, choices: Array<{ label: string; image?: string; action: Action }>): Action {
  return {
    print: `choose one [${choices.map((c) => c.action.print).join(", ")}]`,
    do: (state) => {
      return {
        effect: mergeEffect("or", ...choices.map((c) => getActionChange(c.action, state))),
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
        cards.map((c) => ({ action: cardAction(c.id), label: c.props.name || "", image: c.props.image }))
      );

      if (cards.length === 0) {
        return sequence().do(state);
      }

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
      const action = chooseMultiple(title, choices);
      return action.do(state);
    },
  };
}
