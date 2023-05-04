import { cloneDeep, mapValues, values } from "lodash";
import { State } from "../../types/state";
import { View } from "../../types/view";
import { createCardView } from "./createCardView";
import { applyCardModifier, executeAbility } from "../updates/executeAbility";

export function toView(state: State): View {
  const view: View = cloneDeep({
    cards: mapValues(state.cards, (c) => createCardView(c)),
  });

  while (true) {
    let allApplied = true;

    for (const card of values(view.cards)) {
      for (const ability of card.abilities.filter((a) => !a.applied)) {
        allApplied = false;
        executeAbility(ability.ability, card, state);
        ability.applied = true;
      }
      
      for (const modifier of card.modifiers.filter((m) => !m.applied)) {
        allApplied = false;
        applyCardModifier(modifier.modifier, card, state);
        modifier.applied = true;
      }
    }

    if (allApplied) {
      break;
    }
  }

  return view;
}
