import { cloneDeep, mapValues } from "lodash";
import { CardState, CardView, State, View } from "../types/state";

export function createCardView(state: CardState): CardView {
  const printed = state.definition[state.sideUp];
  return {
    id: state.id,
    props: printed,
  };
}

export function toView(state: State): View {
  const view: View = cloneDeep({
    cards: mapValues(state.cards, (c) => createCardView(c)),
  });

  return { ...view };
}
