import { passageThroughMirkwood } from "./cards/core/scenarios";
import { coreTactics } from "./decks/coreTactics";
import { beginScenario } from "./factories/actions";

const program = beginScenario(passageThroughMirkwood, coreTactics);

console.log(program);

export const App = () => {
  return <pre>{JSON.stringify(program, null, 1)}</pre>;
};
