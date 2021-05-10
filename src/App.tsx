import React, { useContext, useMemo, useState } from "react";
import { createInitState } from "./engine/state";
import { createView } from "./engine/view";
import { GameShow } from "./components/GameShow";
import { DialogsContext } from "./components/DialogsContext";
import { CssBaseline } from "@material-ui/core";
import { reactUI, EngineProvider } from "./components/EngineContext";
import { createEngine } from "./engine/engine";

export function App() {
  const [state, setState] = useState(createInitState());
  const view = createView(state);

  const dialog = useContext(DialogsContext);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const engine = useMemo(() => createEngine(reactUI(dialog), state, setState), []);

  return (
    <>
      <EngineProvider engine={engine}>
        <CssBaseline />
        <GameShow
          view={view}
          onAction={async (action) => {
            await engine.do(action);
          }}
        />
      </EngineProvider>
    </>
  );
}
