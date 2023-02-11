import { CardPredicate, PlayerPredicate } from "../types/basic";

export function and<T extends CardPredicate | PlayerPredicate>(
  values: T[]
): { type: "and"; values: T[] } {
  return { type: "and", values };
}

export function not<T extends CardPredicate | PlayerPredicate>(
  value: T
): { type: "not"; value: T } {
  return { type: "not", value };
}
