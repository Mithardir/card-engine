import produce from "immer";
import { ZoneKey, getZone, mergeAndResults } from "../components/GameShow";
import { CardId, GameZoneType, PlayerId, PlayerZoneType, Side } from "./state";
import { Command, CommandResult, Token } from "./types";

export function zoneKey(type: PlayerZoneType, player: PlayerId): ZoneKey;
export function zoneKey(type: GameZoneType): ZoneKey;
export function zoneKey(type: PlayerZoneType | GameZoneType, player?: PlayerId): ZoneKey {
  return {
    type,
    player,
    print: player ? `${type} of player ${player}` : type,
  } as ZoneKey;
}

export function moveTopCard(from: ZoneKey, to: ZoneKey, side: Side): Command {
  return {
    print: `move to card from ${from.print} to ${to.print} with ${side} side up`,
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
    print: `add ${type} token to card ${cardId}`,
    do: (s) => {
      s.cards.find((c) => c.id === cardId)![type] += 1;
    },
    result: () => "full",
  };
}

export function removeToken(cardId: CardId, type: Token): Command {
  return {
    print: `remove ${type} token from card ${cardId}`,
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

export function repeat(amount: number, cmd: Command): Command {
  return {
    print: `repeat ${amount}x: [${cmd.print}]`,
    do: (s) => {
      for (let index = 0; index < amount; index++) {
        cmd.do(s);
      }
    },
    result: (init) => {
      const results: CommandResult[] = [];
      produce(init, (draft) => {
        for (let index = 0; index < amount; index++) {
          results.push(cmd.result(draft));
          cmd.do(draft);
        }
      });

      return mergeAndResults(...results);
    },
  };
}
