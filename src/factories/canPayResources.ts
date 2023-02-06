import { CardFilter, Sphere } from "../types/basic";


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
