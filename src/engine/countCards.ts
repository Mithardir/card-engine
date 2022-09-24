import { Getter, Predicate } from "./types";
import { CardView } from "../types/state";
import { filterCards } from "./filters";

export function countCards(filter: Predicate<CardView>): Getter<number> {
  return {
    print: `countCards(${filter.print})`,
    get: (state) => {
      return filterCards(filter).get(state).length;
    },
  };
}
