import * as React from "react";
import { useMemo } from "react";
import { toView } from "../engine/view/toView";
import { State, View } from "../types/state";

export const StateContext = React.createContext<{
  state: State;
  view: View;
  setState: (newState: State) => void;
}>({} as any);

export const StateProvider = (
  props: React.PropsWithChildren<{ init: State }>
) => {
  const [state, setState] = React.useState<State>(props.init);
  const view = useMemo(() => toView(state), [state]);

  return (
    <StateContext.Provider value={{ state, setState, view }}>
      {props.children}
    </StateContext.Provider>
  );
};

export function useGameState() {
  return React.useContext(StateContext);
}
