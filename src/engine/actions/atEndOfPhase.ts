import { Action } from "../../../engine/types";


export function atEndOfPhase(action: Action): Action {
  return {
    print: `atEndOfPhase(${action.print})`,
    apply: (s) => {
      s.triggers.end_of_phase.push(action);
    },
  };
}
