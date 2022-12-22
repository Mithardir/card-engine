import { Action, Effect } from "../types";

export function addEffect(effect: Effect): Action {
  return {
    print: `addEffect(${effect.description})`,
    apply: (s) => {
      s.effects.push(effect);
    },
  };
}
