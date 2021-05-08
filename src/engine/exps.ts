import { and, isLocation, isInZone, Filter } from "./filters";
import { PlayerId, playerIds, CardId } from "./state";
import { filterCards, zoneKey } from "./utils";
import { CardView, View } from "./view";

export type Exp<T> = {
  print: string;
  eval: (v: View) => T;
};

export const totalWillpower: Exp<number> = {
  print: "total willpoer",
  eval: (v) => {
    return v.cards
      .filter((c) => c.commitedToQuest)
      .map((c) => c.props.willpower || 0)
      .reduce((p, c) => p + c, 0);
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
  return { print: `${a.print} - ${b.print}`, eval: (v) => a.eval(v) - b.eval(v) };
}

export function isMore(a: Exp<number>, b: Exp<number>): Exp<boolean> {
  return { print: `${a.print} > ${b.print}`, eval: (v) => a.eval(v) > b.eval(v) };
}

export function isSame(a: Exp<number>, b: Exp<number>): Exp<boolean> {
  return { print: `${a.print} == ${b.print}`, eval: (v) => a.eval(v) === b.eval(v) };
}

export function isLess(a: Exp<number>, b: Exp<number>): Exp<boolean> {
  return { print: `${a.print} < ${b.print}`, eval: (v) => a.eval(v) < b.eval(v) };
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
  print: "can travel",
  eval: (v) => {
    const locations = filterCards(and(isLocation, isInZone(zoneKey("stagingArea"))), v);
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
  eval: (v) => playerIds[(playerIds.findIndex((i) => i === v.firstPlayer) + 1) % 4],
};

export const enemiesToEngage: Exp<boolean> = {
  print: "enemiesToEngage",
  eval: (v) => {
    return v.players.some((p) =>
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
    return v.players.length;
  },
};

export function countOfCards(filter: Filter<CardId>): Exp<number> {
  return {
    print: `count of cards that ${filter(0).print}`,
    eval: (v) => {
      return filterCards(filter, v).length;
    },
  };
}

export function getProp(property: "attack" | "defense", cardId: CardId): Exp<number> {
  return {
    print: `${property} of card ${cardId}`,
    eval: (v) => {
      return v.cards.find((c) => c.id === cardId)!.props[property]!;
    },
  };
}

export function filteredCards(filter: Filter<CardId>): Exp<CardView[]> {
  return {
    print: `cards that ${filter(0)}`,
    eval: (v) => filterCards(filter, v),
  };
}
