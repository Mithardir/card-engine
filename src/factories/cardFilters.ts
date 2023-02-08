import { CardFilter, Zone } from "../types/basic";
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
