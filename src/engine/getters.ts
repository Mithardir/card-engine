import { keys, values, last, toPairs } from "lodash";
import { GameZoneType, PlayerZoneType } from "../types/basic";
import {
  CardId,
  CardView,
  ZoneState,
  CardState,
  PlayerId,
} from "../types/state";
import { toView } from "./engine";
import { filterCards, and, isLocation, isInZone } from "./filters";
import { Getter } from "./types";

export const countOfPlayers: Getter<number> = {
  print: `countOfPlayers`,
  get: (s) => keys(s.players).length,
};

export const totalAttack: Getter<number> = {
  print: "totalAttack",
  get: (s) => {
    const view = toView(s);
    const ids = values(s.cards)
      .filter((c) => c.mark.attacking)
      .map((c) => c.id);

    return ids
      .map((c) => view.cards[c])
      .map((c) => c.props.attack || 0)
      .reduce((p, c) => p + c, 0);
  },
};

export const totalWillpower: Getter<number> = {
  print: "totalWillpower",
  get: (s) => {
    const view = toView(s);
    const ids = values(s.cards)
      .filter((c) => c.mark.questing)
      .map((c) => c.id);

    return ids
      .map((c) => view.cards[c])
      .map((c) => c.props.willpower || 0)
      .reduce((p, c) => p + c, 0);
  },
};

export const totalThread: Getter<number> = {
  print: "totalThread",
  get: (s) => {
    const view = toView(s);
    const ids = s.zones.stagingArea.cards;

    return ids
      .map((c) => view.cards[c])
      .map((c) => c.props.threat || 0)
      .reduce((p, c) => p + c, 0);
  },
};

export function minus(a: Getter<number>, b: Getter<number>): Getter<number> {
  return {
    print: `${a.print} - ${b.print}`,
    get: (s) => {
      const va = a.get(s);
      const vb = b.get(s);
      return va - vb;
    },
  };
}

export function isMore(a: Getter<number>, b: Getter<number>): Getter<boolean> {
  return {
    print: `${a.print} > ${b.print}`,
    get: (s) => {
      const va = a.get(s);
      const vb = b.get(s);
      return va > vb;
    },
  };
}

export const canTravel: Getter<boolean> = {
  print: "canTravel",
  get: (s) => {
    const locations = filterCards(
      and(isLocation, isInZone(gameZone("stagingArea")))
    ).get(s);
    return (
      s.zones.activeLocation.cards.length === 0 &&
      locations &&
      locations.length > 0
    );
  },
};

export const enemiesToEngage: Getter<boolean> = {
  print: "enemiesToEngage",
  get: (s) => {
    const view = toView(s);
    return values(s.players).some((p) => {
      const cards = s.zones.stagingArea.cards.map((c) => view.cards[c]);
      return cards.some(
        (c) =>
          c.props.type === "enemy" &&
          c.props.engagement &&
          c.props.engagement <= p.thread
      );
    });
  },
};

export function getProp(
  property: "attack" | "defense" | "hitPoints" | "cost",
  cardId: CardId
): Getter<number> {
  return {
    print: `getProp(${property}, ${cardId})`,
    get: (s) => {
      const card = toView(s).cards[cardId]!;
      return card.props[property] || 0;
    },
  };
}

export function zoneTypeOf(
  card: CardId
): Getter<PlayerZoneType | GameZoneType> {
  return {
    print: `zoneTypeOf(${card})`,
    get: (s) => {
      for (const zone of toPairs(s.zones)) {
        const exist = zone[1].cards.some((c) => c === card);
        if (exist) {
          return zone[0] as any;
        }
      }

      for (const player of values(s.players)) {
        for (const zone of toPairs(player.zones)) {
          const exist = zone[1].cards.some((c) => c === card);
          if (exist) {
            return zone[0] as any;
          }
        }
      }

      throw new Error("card not found");
    },
  };
}

export function cardView(cardId: CardId): Getter<CardView> {
  return {
    print: `cardView(${cardId})`,
    get: (s) => {
      const view = toView(s);
      return view.cards[cardId];
    },
  };
}

export function topCard(getter: Getter<ZoneState>): Getter<CardId | undefined> {
  return {
    print: `topCard(${getter.print})`,
    get: (s) => {
      const zone = getter.get(s)!;
      return last(zone.cards);
    },
  };
}

export function gameZone(type: GameZoneType): Getter<ZoneState> {
  return {
    print: `gameZone(${type})`,
    get: (s) => {
      return s.zones[type];
    },
  };
}

export function playerZone(
  type: PlayerZoneType,
  player: PlayerId
): Getter<ZoneState> {
  return {
    print: `playerZone(${type}, ${player})`,
    get: (s) => {
      return s.players[player]!.zones[type];
    },
  };
}

export function value<T extends { toString: () => string }>(v: T): Getter<T> {
  return {
    print: v.toString(),
    get: () => v,
  };
}
