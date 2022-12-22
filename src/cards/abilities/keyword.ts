import { Keyword } from "../../types/basic";
import { Ability } from "./Ability";


export function keyword(type: Keyword): Ability {
  return {
    description: type,
    implicit: false,
    modify: (c) => {
      c.props.keywords[type] = true;
    },
  };
}
