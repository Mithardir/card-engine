import { values } from "lodash";
import { sequence } from "../../factories/actions";
import { toAction } from "../../factories/limits";
import { Ability, CardId, CardModifier } from "../../types/basic";
import { State } from "../../types/state";
import { CardView } from "../../types/view";
import { evaluateNumber } from "../queries/evaluateNumber";
import { createEventActionView } from "../view/createEventActionView";
import { replaceSelf } from "../../factories/rulesModifiers";

export function executeAbility(
  ability: Ability,
  card: CardView,
  state: State
): void {
  switch (ability.type) {
    case "Keyword":
      return;
    case "Response":
      if (ability.response.type === "receivedDamage") {
        card.responses.receivedDamage.push({
          description: ability.description,
          response: ability.response,
        });
      }
      return;
    case "EventAction":
      card.actions.push(createEventActionView(ability, card));
      return;
    case "ModifySelf":
      const modifier = replaceSelf(card.id).changeCardModifier(
        ability.modifier
      );
      applyCardModifier(modifier, card, state);
      return;
    case "Setup":
      card.setup.push(ability.action);
      return;
    case "CharacterAction":
      const controller = getController(card.id, state);
      if (controller) {
        const effect =
          typeof ability.effect === "function"
            ? ability.effect(controller, card.id)
            : ability.effect;

        const cost = ability.cost(controller, card.id);

        const limit = ability.limit
          ? toAction(ability.limit, card.id, controller)
          : undefined;

        const action = limit
          ? sequence(limit, cost, effect)
          : sequence(cost, effect);

        card.actions.push({
          description: ability.description,
          enabled: { type: "CanExecute", action },
          action: action,
        });
      }

      return;
    default:
      return;
  }
}

export function getController(cardId: CardId, state: State) {
  for (const player of values(state.players)) {
    for (const id of player.zones.playerArea.cards) {
      if (id === cardId) {
        return player.id;
      }
    }
  }

  return undefined;
}

export function applyCardModifier(
  modifier: CardModifier,
  card: CardView,
  state: State
) {
  switch (modifier.type) {
    case "increment":
      if (card.props[modifier.property] !== undefined) {
        card.props[modifier.property]! += evaluateNumber(
          modifier.amount,
          state
        );
      }
      return;
    default:
      throw new Error("unknown modifier");
  }
}
