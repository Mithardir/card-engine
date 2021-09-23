import { map, values } from "lodash";
import {
  and,
  isLocation,
  isInZone,
  CardFilter,
  isHero,
  matchesSphere,
} from "./filters";
import { PlayerId, playerIds, CardId, Token } from "./state";
import { Sphere, ZoneKey } from "./types";
import { filterCards, getZone, zoneKey } from "./utils";
import { CardView, View } from "./view";

export type Exp<T> = {
  print: string;
  eval: (v: View) => T;
};

export function mapExp<TI, TO>(input: Exp<TI>, mapper: (i: TI) => TO): Exp<TO> {
  return {
    print: "",
    eval: (v) => {
      return mapper(input.eval(v));
    },
  };
}

export const totalWillpower: Exp<number> = {
  print: "total willpoer",
  eval: (v) => {
    return v.cards
      .filter((c) => c.mark.questing)
      .map((c) => c.props.willpower || 0)
      .reduce((p, c) => p + c, 0);
  },
};

export const totalAttack: Exp<number> = {
  print: "total attack",
  eval: (v) => {
    return v.cards
      .filter((c) => c.mark.attacking)
      .map((c) => c.props.attack || 0)
      .reduce((p, c) => p + c, 0);
  },
};

export const attackers: Exp<CardId[]> = {
  print: "attackers",
  eval: (v) => {
    return v.cards.filter((c) => c.mark.attacking).map((c) => c.id);
  },
};

export const totalThread: Exp<number> = {
  print: "total thread",
  eval: (v) => {
    return v.cards
      .filter((c) => v.zones.stagingArea.cards.includes(c.id))
      .map((c) => c.props.threat || 0)
      .reduce((p, c) => p + c, 0);
  },
};

export function diff(a: Exp<number>, b: Exp<number>): Exp<number> {
  return {
    print: `${a.print} - ${b.print}`,
    eval: (v) => a.eval(v) - b.eval(v),
  };
}

export function isMore(a: Exp<number>, b: Exp<number>): Exp<boolean> {
  return {
    print: `${a.print} > ${b.print}`,
    eval: (v) => a.eval(v) > b.eval(v),
  };
}

export function isMoreOrEqual(a: Exp<number>, b: Exp<number>): Exp<boolean> {
  return {
    print: `${a.print} >= ${b.print}`,
    eval: (v) => a.eval(v) >= b.eval(v),
  };
}

export function isSame(a: Exp<number>, b: Exp<number>): Exp<boolean> {
  return {
    print: `${a.print} == ${b.print}`,
    eval: (v) => a.eval(v) === b.eval(v),
  };
}

export function isLess(a: Exp<number>, b: Exp<number>): Exp<boolean> {
  return {
    print: `${a.print} < ${b.print}`,
    eval: (v) => a.eval(v) < b.eval(v),
  };
}

export function isLessOrEqual(a: Exp<number>, b: Exp<number>): Exp<boolean> {
  return {
    print: `${a.print} <= ${b.print}`,
    eval: (v) => a.eval(v) <= b.eval(v),
  };
}

export function lit<T extends number | boolean>(value: T): Exp<T> {
  return {
    print: value.toString(),
    eval: () => value,
  };
}

export const existsActiveLocation: Exp<boolean> = {
  print: "is there active location",
  eval: (v) => {
    return v.zones.activeLocation.cards.length > 0;
  },
};

export const canTravel: Exp<boolean> = {
  print: "canTravel",
  eval: (v) => {
    const locations = filterCards(
      and(isLocation, isInZone(zoneKey("stagingArea"))),
      v
    );
    return v.zones.activeLocation.cards.length === 0 && locations.length > 0;
  },
};

export function negate(value: Exp<boolean>): Exp<boolean> {
  return {
    print: `negate (${value.print})`,
    eval: (v) => {
      return !value.eval(v);
    },
  };
}

export const nextPlayerId: Exp<PlayerId> = {
  print: "next player",
  eval: (v) =>
    playerIds[(playerIds.findIndex((i) => i === v.firstPlayer) + 1) % 4],
};

export const enemiesToEngage: Exp<boolean> = {
  print: "enemiesToEngage",
  eval: (v) => {
    return values(v.players).some((p) =>
      v.cards.some(
        (c) =>
          c.props.type === "enemy" &&
          c.props.engagement &&
          c.props.engagement <= p.thread &&
          v.zones.stagingArea.cards.includes(c.id)
      )
    );
  },
};

export const countOfPlayers: Exp<number> = {
  print: "count of players",
  eval: (v) => {
    return values(v.players).length;
  },
};

export function countOfCards(filter: CardFilter): Exp<number> {
  return {
    print: `count of cards that ${filter.toString()}`,
    eval: (v) => {
      return filterCards(filter, v).length;
    },
  };
}

export function getProp(
  property: "attack" | "defense" | "hitPoints" | "cost",
  cardId: CardId
): Exp<number> {
  return {
    print: `${property} of card ${cardId}`,
    eval: (v) => {
      return v.cards.find((c) => c.id === cardId)!.props[property]!;
    },
  };
}

export const alwaysTrue: Exp<boolean> = {
  print: "alwaysTrue",
  eval: () => true,
};

export function getSphere(cardId: CardId): Exp<Sphere> {
  return {
    print: `sphere of card ${cardId}`,
    eval: (v) => {
      return v.cards.find((c) => c.id === cardId)!.props.sphere!;
    },
  };
}

export function getTokens(property: Token, cardId: CardId): Exp<number> {
  return {
    print: `${property} of card ${cardId}`,
    eval: (v) => {
      return v.cards.find((c) => c.id === cardId)!.token[property]!;
    },
  };
}

export function filteredCards(filter: CardFilter): Exp<CardView[]> {
  return {
    print: `cards that ${filter.toString()}`,
    eval: (v) => filterCards(filter, v),
  };
}

export function countResources(sphere: Sphere, player: PlayerId): Exp<number> {
  return {
    print: `countResources(${sphere})`,
    eval: (v) => {
      const heroes = filterCards(
        and(
          isHero,
          matchesSphere(sphere),
          isInZone(zoneKey("playerArea", player))
        ),
        v
      );
      return heroes.reduce((p, c) => p + c.token.resources || 0, 0);
    },
  };
}

export function getOwnerOf(id: CardId): Exp<PlayerId | undefined> {
  return {
    print: `ownerOf(${id})`,
    eval: (v) => {
      for (const player of map(v.players)) {
        for (const zone of map(player.zones)) {
          if (zone.cards.includes(id)) {
            return player.id;
          }
        }
      }

      return undefined;
    },
  };
}

export function getTopCard(zoneKey: ZoneKey): Exp<CardId> {
  return {
    print: `getTopCard${zoneKey.print}`,
    eval: (v) => {
      const zone = getZone(zoneKey)(v);
      if (zone.cards.length > 0) {
        const cardId = zone.cards[zone.cards.length - 1];
        const card = v.cards.find((c) => c.id === cardId)!;
        return card.id;
      } else {
        throw new Error("no cards");
      }
    },
  };
}
