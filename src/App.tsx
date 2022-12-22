import { useState } from "react";
import { passageThroughMirkwood } from "./cards/core/scenarios";
import { coreTactics } from "./decks/coreTactics";
import { createState, nextStep } from "./engine/basic";
import { beginScenario } from "./factories/actions";

const state = createState(beginScenario(passageThroughMirkwood, coreTactics));

console.log(state);

export const App = () => {
  const [version, setVersion] = useState(0);

  return (
    <>
      <button
        onClick={() => {
          try {
            let i = 0;
            while (i < 1000) {
              nextStep(state);
            }
          } finally {
            setVersion((p) => p + 1);
          }
        }}
      >
        Next
      </button>
      <pre>{JSON.stringify(state, null, 1)}</pre>
    </>
  );
};
