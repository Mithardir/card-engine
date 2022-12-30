import { Ability, Keywords } from "../types/basic";

export function keyword(keyword: keyof Keywords): Ability {
  return {
    type: "Keyword",
    keyword,
  };
}
