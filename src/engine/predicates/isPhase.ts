import { Predicate } from "../types";
import { Phase } from "../../types/basic";
import { State } from "../../types/state";

export function isPhase(type: Phase): Predicate<State> {
  return {
    print: `isPhase(${type})`,
    eval: (s) => s.phase === type,
  };
}
