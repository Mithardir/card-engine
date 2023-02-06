import { BoolValue, CardId } from "../types/basic";

export function cardInHand(card: CardId): BoolValue {
  return { type: "CardBoolValue", card, predicate: "inHand" };
}
