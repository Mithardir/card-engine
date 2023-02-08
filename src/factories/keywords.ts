import { Ability } from "../types/basic";
import { Keywords } from "../types/cards";

export function keyword(keyword: keyof Keywords): Ability {
  return {
    type: "Keyword",
    keyword,
  };
}
