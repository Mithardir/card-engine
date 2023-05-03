import { CardModifier, NumberValue } from "../types/basic";

export function addWillpower(amount: NumberValue): CardModifier {
  return {
    type: "increment",
    property: "willpower",
    amount,
  };
}
