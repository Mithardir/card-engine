import { setAutoFreeze } from "immer";
import prettier from "prettier";
import { beginScenario, startGame } from "../engine/actions/phases";
import { playRandomlyUntilEnd } from "../engine/actions/utils";
import { coreTactics, passageThroughMirkwood } from "../engine/setup";
import { createInitState } from "../engine/state";

setAutoFreeze(false);

it("Prints rule script", () => {
  const action = startGame;
  console.log(action.print);
  console.log(prettier.format(action.print));
});

it("Random ai test", () => {
  const state = createInitState();
  const result = playRandomlyUntilEnd(state, beginScenario(passageThroughMirkwood, coreTactics));
  console.log(result);
});
