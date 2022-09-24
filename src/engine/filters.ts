import { toPairs, values } from "lodash";
import { GameZoneType, Mark, PlayerZoneType, Sphere } from "../types/basic";
import { CardView, ZoneState, PlayerId, State, CardId } from "../types/state";
import { toView } from "./engine";
import { zoneTypeOf } from "./getters";
import { controllerOf } from "./getters/controllerOf";
import { ownerOf } from "./getters/ownerOf";
import { Predicate, Getter } from "./types";

export function filterCards(
  predicate: Predicate<CardView>
): Getter<CardView[]> {
  return {
    print: `filterCards(${predicate.print})`,
    get: (s) => {
      const all = values(toView(s).cards);
      return all.filter((c) => predicate.eval(c, s));
    },
  };
}

export const isHero: Predicate<CardView> = {
  print: "isHero",
  eval: (card) => card.props.type === "hero",
};

export type CardPredicate = {
  print: string;
  card: (card: CardId) => Predicate<State>;
};

export const isInPlay: Predicate<CardView> & CardPredicate = {
  print: "isInPlay",
  eval: (card, state) => {
    const inStaging = state.zones.stagingArea.cards.includes(card.id);
    const inPlayerArea = values(state.players).some(
      (p) =>
        p.zones.engaged.cards.includes(card.id) ||
        p.zones.playerArea.cards.includes(card.id)
    );

    return inStaging || inPlayerArea;
  },
  card: (card) => {
    return {
      print: "isInPlay",
      eval: (state) => {
        const inStaging = state.zones.stagingArea.cards.includes(card);
        const inPlayerArea = values(state.players).some(
          (p) =>
            p.zones.engaged.cards.includes(card) ||
            p.zones.playerArea.cards.includes(card)
        );

        return inStaging || inPlayerArea;
      },
    };
  },
};

export function hasOwner(player: PlayerId): Predicate<CardView> {
  return {
    print: "hasOwner",
    eval: (card, state) => {
      const owner = ownerOf(card.id).get(state);
      return player === owner;
    },
  };
}

export function hasController(player: PlayerId): Predicate<CardView> {
  return {
    print: "hasController",
    eval: (card, state) => {
      const controller = controllerOf(card.id).get(state);
      return player === controller;
    },
  };
}

export function and<T>(...filters: Predicate<T>[]): Predicate<T> {
  return {
    print: `${filters.map((f) => f.print).join(" && ")}`,
    eval: (v, s) => filters.every((f) => f.eval(v, s)),
  };
}

export function someCards(predicate: Predicate<CardView>): Getter<boolean> {
  return {
    print: `someCards(${predicate.print})`,
    get: (s) => values(toView(s).cards).some((c) => predicate.eval(c, s)),
  };
}

export const isCharacter: Predicate<CardView> = {
  print: "isCharacter",
  eval: (card) => {
    const type = card.props.type;
    return type === "hero" || type === "ally";
  },
};

export const isDamaged: Predicate<CardView> = {
  print: "isDamaged",
  eval: (card, state) => {
    return state.cards[card.id].token.damage > 0;
  },
};

export const isLocation: Predicate<CardView> = {
  print: "isLocation",
  eval: (card) => card.props.type === "location",
};

export const isEnemy: Predicate<CardView> = {
  print: "isEnemy",
  eval: (card) => card.props.type === "enemy",
};

export function canAttack(player: PlayerId): Predicate<CardView> {
  return {
    print: `canAttack(${player})`,
    eval: (card) => !card.rules.cantAttackPlayer.includes(player),
  };
}

export const isTapped: Predicate<CardView> = {
  print: "isTapped",
  eval: (card, state) => state.cards[card.id].tapped,
};

export function hasResource(sphere: Sphere): Predicate<CardView> {
  return {
    print: "isTapped",
    eval: (card, state) =>
      (sphere === "neutral" || card.props.sphere === sphere) &&
      state.cards[card.id].token.resources > 0,
  };
}

export const isReady: Predicate<CardView> = {
  print: "isReady",
  eval: (card, state) => !state.cards[card.id].tapped,
};

export function hasMark(type: Mark): Predicate<CardView> {
  return {
    print: "hasMark",
    eval: (card, state) => state.cards[card.id].mark[type],
  };
}

export function not<T>(value: Predicate<T>): Predicate<T> {
  return {
    print: `not(${value.print})`,
    eval: (item, state) => !value.eval(item, state),
  };
}

export function isInZone(zone: Getter<ZoneState>): Predicate<CardView> {
  return {
    print: `isInZone(${zone.print})`,
    eval: (card, state) => zone.get(state)?.cards.includes(card.id) || false,
  };
}

export function isInZoneType(
  type: GameZoneType | PlayerZoneType
): Predicate<CardView> {
  return {
    print: `isInZoneType(${type})`,
    eval: (card, state) => zoneTypeOf(card.id).get(state) === type,
  };
}

export function withMaxEngagement(player: PlayerId): Predicate<CardView> {
  return {
    print: "withMaxEngagement",
    eval: (card, state) => {
      const threat = state.players[player]!.thread;
      const view = toView(state);
      const cards = state.zones.stagingArea.cards
        .map((c) => view.cards[c])
        .filter(
          (c) =>
            c.props.type === "enemy" &&
            c.props.engagement &&
            c.props.engagement <= threat
        );

      const max = cards
        .filter((c) => c.props.engagement !== undefined)
        .map((c) => c.props.engagement!)
        .reduce((p, c) => (p > c ? p : c), 0);

      return card.props.engagement === max;
    },
  };
}
