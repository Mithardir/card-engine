import { sequence } from "../../factories/actions";
import { Ability, CardModifier, PlayerId } from "../../types/basic";
import { State } from "../../types/state";
import { CardView } from "../../types/view";
import { canExecuteAction } from "../queries/canExecuteAction";
import { evaluateNumber } from "../queries/evaluateNumber";
import { createEventActionView } from "../view/createEventActionView";

export function executeAbility(
  ability: Ability,
  card: CardView,
  state: State
): void {
  switch (ability.type) {
    case "Keyword":
    case "Response":
      return;
    case "EventAction":
      card.actions.push(createEventActionView(ability, card));
      return;
    case "ModifySelf":
      const modifier = ability.modifier(card.id);
      applyCardModifier(modifier, card, state);
      return;
    case "Setup":
      card.setup.push(ability.action);
      return;
    case "CharacterAction":
      const action = (caster: PlayerId) => {
        const effect =
          typeof ability.effect === "function"
            ? ability.effect(caster, card.id)
            : ability.effect;
        const cost = ability.cost(caster, card.id);
        return sequence(cost, effect);
      };

      card.actions.push({
        description: ability.description,
        enabled: (caster, state) => canExecuteAction(action(caster), state),
        action: action,
      });

      return;
    default:
      return;
  }
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
