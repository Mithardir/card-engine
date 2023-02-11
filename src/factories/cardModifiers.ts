import { CardModifier, NumberValue } from "../types/basic";

export type CardNumberProp = "attack" | "willpower";

export function increment(
  property: CardNumberProp,
  amount: NumberValue
): CardModifier {
  return {
    type: "increment",
    property,
    amount,
  };
}
