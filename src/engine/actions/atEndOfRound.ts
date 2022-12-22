import { Action } from "../types";


export function atEndOfRound(action: Action): Action {
  return {
    print: `atEndOfRound(${action.print})`,
    apply: (s) => {
      s.triggers.end_of_round.push(action);
    },
  };
}
