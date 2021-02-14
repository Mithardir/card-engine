import { Card } from "../../../engine/state";
import { quest } from "../../definitions/quest";

export const fliesAndSpiders: Card = () =>
  quest({
    name: "Flies and Spiders",
    sequence: 1,
    questPoints: 8,
  });
