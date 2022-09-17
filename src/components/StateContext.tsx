import * as React from "react";
import { State } from "../types/state";

export const StateContext = React.createContext<{
  state: State;
  setState: (newState: State) => void;
}>({} as any);

export const StateProvider = (
  props: React.PropsWithChildren<{ init: State }>
) => {
  const [state, setState] = React.useState<State>(props.init);

  return (
    <StateContext.Provider value={{ state, setState }}>
      {props.children}
    </StateContext.Provider>
  );
};
