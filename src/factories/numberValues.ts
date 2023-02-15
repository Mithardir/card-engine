import { CardId, CardNumberValue, NumberValue } from "../types/basic";

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
