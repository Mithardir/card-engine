import { CardAction } from "../../types/actions";
import { CardId } from "../../types/basic";
import { State } from "../../types/state";
import { evaluateNumber } from "./evaluateNumber";

export function canExecuteCardAction(
  action: CardAction,
  cardId: CardId,
  state: State
): boolean {
  const card = state.cards[cardId];
  if (typeof action === "string") {
    switch (action) {
      case "Discard":
      case "TravelTo":
        return true;
      case "Exhaust":
        return !card.tapped;
      case "Ready":
        return card.tapped;
      default:
        throw new Error(
          `unknown card action for result: ${JSON.stringify(action)}`
        );
    }
  } else {
    switch (action.type) {
      case "DealDamage":
      case "ResolveEnemyAttacking":
      case "Mark":
      case "AddModifier":
        return true;
      case "Heal":
        return card.token.damage > 0;
      case "PayResources":
        const amount = evaluateNumber(action.amount, state);
        return card.token.resources >= amount;
      case "Sequence":
        return action.actions.every((a) =>
          canExecuteCardAction(a, card.id, state)
        );
      default: {
        throw new Error(
          `unknown card action for result: ${JSON.stringify(action)}`
        );
      }
    }
  }
}
