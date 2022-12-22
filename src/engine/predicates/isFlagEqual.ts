import {
  Getter,
  Predicate
} from "../types";
import { State } from "../../types/state";


export function isFlagEqual<T>(
  name: string,
  value: Getter<T>
): Predicate<State> {
  return {
    print: `setFlag(${name}, ${value.print})`,
    eval: (state) => state.flags[name] === value.get(state),
  };
}
