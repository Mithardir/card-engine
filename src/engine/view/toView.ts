import { cloneDeep, mapValues, values } from "lodash";
import { State, View } from "../../types/state";
import { createCardView } from "./createCardView";
import { executeAbility } from "../updates/executeAbility";

export function toView(state: State): View {
  const view: View = cloneDeep({
    cards: mapValues(state.cards, (c) => createCardView(c)),
  });

  while (true) {
    let allApplied = true;

    for (const card of values(view.cards)) {
      for (const ability of card.abilities.filter((a) => !a.applied)) {
        allApplied = false;
        executeAbility(ability.ability, card);
        ability.applied = true;
      }
    }

    if (allApplied) {
      break;
    }
  }

  return view;
}
