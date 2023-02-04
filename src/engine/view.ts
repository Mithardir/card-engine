import { cloneDeep, defer, mapValues, values } from "lodash";
import {
  discard,
  payResources,
  sequence,
  targetPlayer,
} from "../factories/actions";
import { and } from "../factories/boolValues";
import { Action, PlayerAction } from "../types/actions";
import {
  Ability,
  BoolValue,
  CardId,
  EventActionAbility,
  PlayerId,
} from "../types/basic";
import { ActionView, CardState, CardView, State, View } from "../types/state";

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

export function createEventActionView(
  ability: EventActionAbility,
  card: CardView
): ActionView {
  if (!card.props.sphere || card.owner === "game") {
    return {
      action: "Empty",
      enabled: false,
    };
  }

  const payCost = payResources(
    card.props.cost || 0,
    card.props.sphere === "neutral" ? "any" : card.props.sphere
  );

  return {
    action: sequence(
      targetPlayer(card.owner).to(payCost),
      ability.effect,
      discardCard(card.id)
    ),
    enabled: and(cardInHand(card.id), canPayCost(card.owner, payCost)),
  };
}

export function canPayCost(player: PlayerId, cost: PlayerAction): BoolValue {
  return {
    type: "PlayerBoolValue",
    player,
    predicate: {
      type: "CanPayCost",
      cost,
    },
  };
}

export function discardCard(card: CardId): Action {
  return {
    type: "CardAction",
    card,
    action: "Discard",
  };
}

export function cardInHand(card: CardId): BoolValue {
  return { type: "CardBoolValue", card, predicate: "inHand" };
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
