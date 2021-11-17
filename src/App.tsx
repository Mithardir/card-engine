import { useMemo } from "react";
import { createInitState, State } from "./engine/state";
import { GameShow } from "./components/GameShow";
import { CssBaseline } from "@material-ui/core";
import { EngineProvider } from "./components/EngineContext";
import { createEngine } from "./engine/engine";

export function App(props: { state?: State }) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const engine = useMemo(
    () => createEngine(props.state || createInitState()),
    [props.state]
  );

  return (
    <>
      <EngineProvider engine={engine}>
        <CssBaseline />
        <GameShow engine={engine} />
      </EngineProvider>
    </>
  );
}
