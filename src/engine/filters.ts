import { Exp } from "./exps";
import { CardId, PlayerId } from "./state";
import { ZoneKey } from "./types";
import { getZone } from "./utils";

// TODO print
export type Filter<T> = (value: T) => Exp<boolean>;

export const all: Filter<any> = () => ({ print: "all", eval: () => true });

export const isHero: Filter<CardId> = (card) => ({
  print: "isHero",
  eval: (view) => {
    return view.cards.find((c) => c.id === card)!.props.type === "hero";
  },
});

export const isEnemy: Filter<CardId> = (card) => ({
  print: "isEnemy",
  eval: (view) => {
    return view.cards.find((c) => c.id === card)!.props.type === "enemy";
  },
});

export function isInZone(zone: ZoneKey): Filter<CardId> {
  return (card) => ({
    print: `isInZone(${zone.print})`,
    eval: (view) => getZone(zone)(view).cards.includes(card),
  });
}

export function and<T>(...filters: Filter<T>[]): Filter<T> {
  return (item) => ({
    print: `${filters.map((f) => f(item).print).join(" && ")}`,
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
  print: "isTapped",
  eval: (view) => {
    const card = view.cards.find((c) => c.id === id)!;
    return card.tapped;
  },
});

export const isReady: Filter<CardId> = (id) => ({
  print: "is ready",
  eval: (view) => {
    const card = view.cards.find((c) => c.id === id)!;
    return !card.tapped;
  },
});

export function withMaxEngagement(player: PlayerId): Filter<CardId> {
  return (cardId) => ({
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

      const card = v.cards.find((c) => c.id === cardId)!;

      return card.props.engagement === max;
    },
  });
}
