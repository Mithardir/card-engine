import { mapValues, values } from "lodash";
import { Getter } from "./types";
import { Side } from "../types/basic";
import {
  CardDefinition,
  CardId,
  CardState,
  CardView,
  State,
  View,
} from "../types/state";

export function createCardView(state: CardState): CardView {
  const printed = state.definition[state.sideUp];
  return {
    id: state.id,
    props: printed,
    setup: [],
    abilities: printed.abilities?.map((a) => ({ ...a, applied: false })) || [],
    actions: [],
  };
}

export function toView(state: State): View {
  const view: View = {
    cards: mapValues(state.cards, (c) => createCardView(c)),
  };

  while (true) {
    let allApplied = true;
    values(view.cards).forEach((card) => {
      card.abilities
        .filter((a) => !a.applied)
        .forEach((ability) => {
          allApplied = false;
          ability.modify(card, state);
          ability.applied = true;
        });
    });

    if (allApplied) {
      break;
    }
  }

  return { ...view };
}

export function nextStep(state: State): void {
  const action = state.next.shift();
  if (action) {
    action.apply(state);
  }
}

export function createCardState(
  id: CardId,
  definition: CardDefinition,
  side: Side
): CardState {
  return {
    id,
    token: {
      damage: 0,
      progress: 0,
      resources: 0,
    },
    mark: {
      questing: false,
      attacking: false,
      defending: false,
      attacked: false,
    },
    sideUp: side,
    tapped: false,
    definition: definition,
  };
}
