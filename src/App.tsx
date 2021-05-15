import { useContext, useMemo, useState } from "react";
import { createInitState, State } from "./engine/state";
import { GameShow } from "./components/GameShow";
import { DialogsContext } from "./components/DialogsContext";
import { CssBaseline } from "@material-ui/core";
import { reactUI, EngineProvider } from "./components/EngineContext";
import { createEngine } from "./engine/engine";

export function App(props: { state?: State }) {
  const [state, setState] = useState(props.state || createInitState());

  const dialog = useContext(DialogsContext);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const engine = useMemo(() => createEngine(reactUI(dialog), state, setState), []);

  return (
    <>
      <EngineProvider engine={engine}>
        <CssBaseline />
        <GameShow engine={engine} />
      </EngineProvider>
    </>
  );
}
