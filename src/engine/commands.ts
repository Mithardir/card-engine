import { ZoneKey, getZone } from "../components/GameShow";
import { CardId, Side } from "./state";
import { Command, Token } from "./types";

export function moveTopCard(from: ZoneKey, to: ZoneKey, side: Side): Command {
  return {
    print: `moveTopCard(from:${JSON.stringify(from)}, to:${JSON.stringify(from)}, side:${side})`,
    do: (s) => {
      const fromZone = getZone(from)(s);
      const toZone = getZone(to)(s);
      if (fromZone.cards.length > 0) {
        const cardId = fromZone.cards.pop()!;
        const card = s.cards.find((c) => c.id === cardId)!;
        card.sideUp = side;
        toZone.cards.push(cardId);
      }
    },
    result: (s) => {
      return getZone(from)(s).cards.length > 0 ? "full" : "none";
    },
  };
}

export function addToken(cardId: CardId, type: Token): Command {
  return {
    print: `addToken(${cardId}, ${type})`,
    do: (s) => {
      s.cards.find((c) => c.id === cardId)![type] += 1;
    },
    result: () => "full",
  };
}

export function removeToken(cardId: CardId, type: Token): Command {
  return {
    print: `removeToken(${cardId}, ${type})`,
    do: (s) => {
      const card = s.cards.find((c) => c.id === cardId)!;
      if (card[type] >= 1) {
        card[type] -= 1;
      }
    },
    result: (s) => {
      const card = s.cards.find((c) => c.id === cardId)!;
      return card[type] >= 1 ? "full" : "none";
    },
  };
}
