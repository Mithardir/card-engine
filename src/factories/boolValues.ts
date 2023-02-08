import { PlayerAction } from "../types/actions";
import { BoolValue, CardId, PlayerId } from "../types/basic";

export function isQuesting(card: CardId): BoolValue {
  throw new Error("not implemented");
}

export function isEnemy(card: CardId): BoolValue {
  throw new Error("not implemented");
}

export function and(...values: BoolValue[]): BoolValue {
  return {
    type: "And",
    values,
  };
}

export function cardInHand(card: CardId): BoolValue {
  return { type: "CardBoolValue", card, predicate: "inHand" };
}
