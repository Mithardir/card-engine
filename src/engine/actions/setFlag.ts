import { Action, Getter } from "../types";


export function setFlag<T>(name: string, value: Getter<T>): Action {
  return {
    print: `setFlag(${name}, ${value.print})`,
    apply: (s) => {
      s.flags[name] = value.get(s);
    },
  };
}
