import { beginScenario } from "./types/actions";

const program = beginScenario(
  { name: "test", encounterCards: [], questCards: [] },
  { name: "testA", heroes: [], library: [] },
  { name: "testB", heroes: [], library: [] }
);

console.log(program);

export const App = () => {
  return <pre>{JSON.stringify(program, null, 1)}</pre>;
};
