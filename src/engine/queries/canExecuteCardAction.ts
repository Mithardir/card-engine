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
        return true;
      default:
        throw new Error(
          `unknown card action for result: ${JSON.stringify(action)}`
        );
    }
  } else {
    switch (action.type) {
      case "Heal":
        return card.token.damage > 0;
      case "PayResources":
        const amount = evaluateNumber(action.amount, state);
        return card.token.resources >= amount;
      default: {
        throw new Error(
          `unknown card action for result: ${JSON.stringify(action)}`
        );
      }
    }
  }
}
