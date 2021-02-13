import produce from "immer";
import { ZoneKey, getZone } from "../components/GameShow";
import { CardId, Side } from "./state";
import { Command, Token } from "./types";

export function moveTopCard(from: ZoneKey, to: ZoneKey, side: Side): Command {
  return {
    print: `moveTopCard(from:${JSON.stringify(from)}, to:${JSON.stringify(from)}, side:${side})`,
    do: (s) => {
      return produce(s, (draft) => {
        const fromZone = getZone(from)(draft);
        const toZone = getZone(to)(draft);
        if (fromZone.cards.length > 0) {
          const cardId = fromZone.cards.pop()!;
          const card = draft.cards.find((c) => c.id === cardId)!;
          card.sideUp = side;
          toZone.cards.push(cardId);
        }
      });
    },
    result: (s) => {
      return getZone(from)(s).cards.length > 0 ? "full" : "none";
    },
  };
}

export function addToken(cardId: CardId, type: Token, amount: number = 1): Command {
  return {
    print: `addToken(${cardId}, ${type}, ${amount})`,
    do: (s) => {
      return produce(s, (draft) => {
        draft.cards.find((c) => c.id === cardId)![type] += amount;
      });
    },
    result: () => "full",
  };
}
