import { CardAction } from "../../types/actions";
import { CardId } from "../../types/basic";
import { State } from "../../types/state";

export type ResultType = "full" | "partial" | "none";

export function getCardActionResultType(
  action: CardAction,
  cardId: CardId,
  state: State
): ResultType {
  const card = state.cards[cardId];
  if (typeof action === "string") {
    switch (action) {
      default:
        throw new Error(
          `unknown card action for result: ${JSON.stringify(action)}`
        );
    }
  } else {
    switch (action.type) {
      case "Heal": {
        return card.token.damage > 0 ? "full" : "none";
      }
      default: {
        throw new Error(`unknown card action: ${JSON.stringify(action)}`);
      }
    }
  }
}
