import { BoolValue, CardId } from "../types/basic";

export function isQuesting(card: CardId): BoolValue {
  throw new Error("not implemented");
}

export function isEnemy(card: CardId): BoolValue {
  throw new Error("not implemented");
}

export function and(...values: BoolValue[]): BoolValue {
  throw new Error("not implemented");
}
