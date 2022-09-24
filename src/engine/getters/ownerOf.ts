import { Getter } from "../types";
import { CardId, PlayerId } from "../../types/state";


export function ownerOf(card: CardId): Getter<PlayerId | undefined> {
  return {
    print: `ownerOf(${card})`,
    get: (s) => s.cards[card].controller,
  };
}
