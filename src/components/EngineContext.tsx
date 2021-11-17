import React, { useContext, createContext } from "react";
import { Engine } from "../engine/engine";

const EngineContext = createContext<Engine>(undefined as any);

export const EngineProvider = (
  props: React.PropsWithChildren<{ engine: Engine }>
) => {
  return (
    <EngineContext.Provider value={props.engine}>
      {props.children}
    </EngineContext.Provider>
  );
};

export const useEngine = () => useContext(EngineContext);
