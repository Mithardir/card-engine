import { CardId, NumberValue } from "../types/basic";

export type CardNumberValue = "damage";

export function cardNumberValue(
  card: CardId,
  property: CardNumberValue
): NumberValue {
  return {
    type: "CardNumberValue",
    card,
    property,
  };
}
