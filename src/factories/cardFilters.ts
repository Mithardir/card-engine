import {
  CardFilter,
  CardPredicate,
  Mark,
  PlayerId,
  Zone,
} from "../types/basic";
import { Sphere } from "../types/cards";

export function canPayResources(
  amount: number,
  sphere: Sphere | "any"
): CardFilter {
  if (sphere === "any") {
    return {
      type: "and",
      values: [
        "inPlay",
        {
          type: "HasResources",
          amount,
        },
      ],
    };
  } else {
    return {
      type: "and",
      values: [
        "inPlay",
        { type: "HasSphere", sphere },
        {
          type: "HasResources",
          amount,
        },
      ],
    };
  }
}

export function topCard(zone: Zone): CardFilter {
  return {
    type: "TopCard",
    zone,
  };
}

export function hasMark(mark: Mark): CardPredicate {
  return {
    type: "HasMark",
    mark,
  };
}

export function hasSphere(sphere: Sphere): CardPredicate {
  return {
    type: "HasSphere",
    sphere,
  };
}

export function hasConstroller(player: PlayerId): CardPredicate {
  return {
    type: "HasController",
    player,
  };
}

export function isInZone(zone: Zone): CardPredicate {
  return {
    type: "IsInZone",
    zone,
  };
}
