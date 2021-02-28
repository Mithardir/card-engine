import { CardId, PlayerId, playerIds } from "./state";
import { Action, ZoneKey } from "./types";
import { getZone } from "./utils";
import { createView, View } from "./view";

export type Exp<T> = {
  print: string;
  eval: (v: View) => T;
};

// TODO print
export type Filter<T> = (value: T) => Exp<boolean>;

export const filterCards = (filter: Filter<CardId>, view: View) =>
  view.cards.filter((c) => filter(c.id).eval(view)).map((z) => z);

export const all: Filter<any> = () => ({ print: "all", eval: () => true });

export const isHero: Filter<CardId> = (card) => ({
  print: "is hero",
  eval: (view) => {
    return view.cards.find((c) => c.id === card)!.props.type === "hero";
  },
});

export const isEnemy: Filter<CardId> = (card) => ({
  print: "is enemy",
  eval: (view) => {
    return view.cards.find((c) => c.id === card)!.props.type === "enemy";
  },
});

export function isInZone(zone: ZoneKey): Filter<CardId> {
  return (card) => ({
    print: `is in zone ${zone.print}`,
    eval: (view) => getZone(zone)(view).cards.includes(card),
  });
}

export function and<T>(...filters: Filter<T>[]): Filter<T> {
  return (item) => ({
    print: `${filters.map((f) => f(item).print).join(" and ")}`,
    eval: (v) => filters.every((f) => f(item).eval(v)),
  });
}

export const isLocation: Filter<CardId> = (card) => ({
  print: "is location",
  eval: (view) => {
    return view.cards.find((c) => c.id === card)!.props.type === "location";
  },
});

export const isCharacter: Filter<CardId> = (card) => ({
  print: "is character",
  eval: (view) => {
    const type = view.cards.find((c) => c.id === card)!.props.type;
    return type === "hero" || type === "ally";
  },
});

export const isTapped: Filter<CardId> = (id) => ({
  print: "is tapped",
  eval: (view) => {
    const card = view.cards.find((c) => c.id === id)!;
    return card.tapped;
  },
});

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

export function lit(value: number): Exp<number> {
  return {
    print: value.toString(),
    eval: () => value,
  };
}

export const isThereActiveLocation: Exp<boolean> = {
  print: "is there active location",
  eval: (v) => {
    return v.zones.activeLocation.cards.length > 0;
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

export function withMaxEngegament(player: PlayerId): Filter<CardId> {
  return (cardId) => ({
    print: "withMaxEngegament",
    eval: (v) => {
      const threat = v.players.find((p) => p.id === player)!.thread;
      const cards = v.cards.filter(
        (c) =>
          c.props.type === "enemy" &&
          c.props.engagement &&
          c.props.engagement <= threat &&
          v.zones.stagingArea.cards.includes(c.id)
      );

      const max = cards
        .filter((c) => c.props.engagement !== undefined)
        .map((c) => c.props.engagement!)
        .reduce((p, c) => (p > c ? p : c), 0);

      const card = v.cards.find((c) => c.id === cardId)!;

      return card.props.engagement === max;
    },
  });
}
