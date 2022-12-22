import { Action } from "../../engine/types";
import { Ability } from "./Ability";


export function setup(props: { description: string; action: Action; }): Ability {
  return {
    description: props.description,
    implicit: false,
    modify: (card) => card.setup.push(props.action),
  };
}
