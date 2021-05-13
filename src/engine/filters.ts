import { Exp } from "./exps";
import { CardId, Mark, PlayerId } from "./state";
import { Token, ZoneKey } from "./types";
import { getZone } from "./utils";
import { CardView } from "./view";

// TODO print
export type Filter<T> = (value: T) => Exp<boolean>;

export type CardFilter = Filter<CardView>;

export const all: Filter<any> = () => ({ print: "all", eval: () => true });

export const isHero: CardFilter = (card) => ({
  print: "isHero",
  eval: (view) => {
    return card.props.type === "hero";
  },
});

export const isEnemy: CardFilter = (card) => ({
  print: "isEnemy",
  eval: (view) => {
    return card.props.type === "enemy";
  },
});

export function isInZone(zone: ZoneKey): CardFilter {
  return (card) => ({
    print: `isInZone(${zone.print})`,
    eval: (view) => getZone(zone)(view).cards.includes(card.id),
  });
}

export function and<T>(...filters: Filter<T>[]): Filter<T> {
  return (item) => ({
    print: `${filters.map((f) => f(item).print).join(" && ")}`,
    eval: (v) => filters.every((f) => f(item).eval(v)),
  });
}

export const isLocation: CardFilter = (card) => ({
  print: "is location",
  eval: (view) => {
    return card.props.type === "location";
  },
});

export const isCharacter: CardFilter = (card) => ({
  print: "is character",
  eval: (view) => {
    const type = card.props.type;
    return type === "hero" || type === "ally";
  },
});

export const isTapped: CardFilter = (card) => ({
  print: "isTapped",
  eval: (view) => {
    return card.tapped;
  },
});

export function hasToken(type: Token): CardFilter {
  return (card) => ({
    print: "hasMark",
    eval: (view) => {
      return card.token[type] > 0;
    },
  });
}

export function hasMark(type: Mark): CardFilter {
  return (card) => ({
    print: "hasMark",
    eval: (view) => {
      return card.mark[type];
    },
  });
}

export function hasNotMark(type: Mark): CardFilter {
  return (card) => ({
    print: "hasMark",
    eval: (view) => {
      return !card.mark[type];
    },
  });
}

export const isReady: CardFilter = (card) => ({
  print: "is ready",
  eval: (view) => {
    return !card.tapped;
  },
});

export function withMaxEngagement(player: PlayerId): CardFilter {
  return (card) => ({
    print: "withMaxEngagement",
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

      return card.props.engagement === max;
    },
  });
}
