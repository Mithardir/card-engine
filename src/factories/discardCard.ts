import { Action } from "../types/actions";
import { CardId } from "../types/basic";

export function discardCard(card: CardId): Action {
  return {
    type: "CardAction",
    card,
    action: "Discard",
  };
}
