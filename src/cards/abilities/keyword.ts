import { Keyword } from "../../types/basic";
import { Ability } from "../sets/core/quests";


export function keyword(type: Keyword): Ability {
  return {
    description: type,
    implicit: false,
    modify: (c) => {
      c.props.keywords[type] = true;
    },
  };
}
