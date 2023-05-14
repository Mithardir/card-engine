import { CardNumberValue, CardTarget, NumberValue } from "../types/basic";

export function cardNumberValue(
  card: CardTarget,
  property: CardNumberValue
): NumberValue {
  return {
    type: "CardNumberValue",
    card,
    property,
  };
}
