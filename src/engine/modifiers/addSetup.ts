import { Action } from "../types";
import { CardModification } from "./CardModification";

export function addSetup(action: Action): CardModification {
  return {
    print: `addSetup(${action.print})`,
    modify: (c) => c.setup.push(action),
  };
}
