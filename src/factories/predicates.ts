import { CardPredicate, PlayerPredicate } from "../types/basic";

export function and<T extends CardPredicate | PlayerPredicate>(
  values: T[]
): { type: "and"; values: T[] } {
  return { type: "and", values };
}
