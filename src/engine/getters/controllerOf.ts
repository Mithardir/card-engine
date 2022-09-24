import { Getter } from "../types";
import { CardId, PlayerId } from "../../types/state";

export function controllerOf(card: CardId): Getter<PlayerId | undefined> {
  return {
    print: `controllerOf(${card})`,
    get: (s) => s.cards[card].controller,
  };
}
