import { CardState, CardView } from "../../types/state";

export function createCardView(state: CardState): CardView {
  const printed = state.definition[state.sideUp];
  return {
    props: printed,
    actions: [],
    abilities: printed.abilities
      ? printed.abilities.map((a) => ({ applied: false, ability: a }))
      : [],
    ...state,
  };
}
