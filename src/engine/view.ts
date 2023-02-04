import { cloneDeep, defer, mapValues, values } from "lodash";
import { discard, sequence } from "../factories/actions";
import { Action } from "../types/actions";
import { Ability, EventActionAbility } from "../types/basic";
import { ActionView, CardState, CardView, State, View } from "../types/state";

export function createCardView(state: CardState): CardView {
  const printed = state.definition[state.sideUp];
  return {
    id: state.id,
    props: printed,
    actions: [],
    abilities: printed.abilities
      ? printed.abilities.map((a) => ({ applied: false, ability: a }))
      : [],
  };
}

export function createEventActionView(
  ability: EventActionAbility,
  card: CardView
): ActionView {
  return {
    action: sequence(ability.effect, {
      type: "CardAction",
      card: card.id,
      action: "Discard",
    }),
    enabled: { type: "CardBoolValue", card: card.id, predicate: "inHand" },
  };
}

export function executeAbility(ability: Ability, card: CardView): void {
  switch (ability.type) {
    case "Keyword":
    case "ModifySelf":
    case "Response":
      return;
    case "EventAction":
      card.actions.push(createEventActionView(ability, card));
      return;
    default:
      return;
  }
}

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
