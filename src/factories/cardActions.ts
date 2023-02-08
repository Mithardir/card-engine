import { CardAction } from "../types/actions";
import { CardModifier } from "../types/basic";

export function dealDamage(amount: number): CardAction {
  return {
    type: "DealDamage",
    amount,
  };
}

export function heal(amount: number | "all"): CardAction {
  return {
    type: "Heal",
    amount,
  };
}

export function exhaust(): CardAction {
  throw new Error("not implemented");
}

export function modify(params: {
  description: string;
  modifier: CardModifier;
  until: "end_of_phase";
}): CardAction {
  throw new Error("not implemented");
}
