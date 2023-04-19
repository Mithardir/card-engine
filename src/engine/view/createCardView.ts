import { CardState } from "../../types/state";
import { CardView } from "../../types/view";

export function createCardView(state: CardState): CardView {
  const printed = state.definition[state.sideUp];
  return {
    props: printed,
    actions: [],
    responses: {
      receivedDamage: [],
    },
    setup: [],
    abilities: printed.abilities
      ? printed.abilities.map((a) => ({ applied: false, ability: a }))
      : [],
    ...state,
  };
}
