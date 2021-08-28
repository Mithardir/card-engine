import { State } from "./state";
import { sequence } from "./actions/control";
import { Action, ActionResult } from "./actions/types";
import { observable, runInAction, toJS } from "mobx";
import { playerActions } from "./actions/game";

export type Engine = {
  state: State;
  result?: ActionResult;
  do: (action: Action, resolvePlayerActions?: boolean) => void;
};

export function createEngine(init: State) {
  let state = observable(init);
  let lastResult = observable.box<ActionResult | undefined>(undefined);

  const engine: Engine = {
    get state() {
      return state;
    },
    get result() {
      return lastResult.get();
    },
    do: (action, resolvePlayerActions) => {
      const nextTitle =
        lastResult.get()?.choice?.dialog === false &&
        resolvePlayerActions !== true
          ? lastResult.get()?.choice?.title
          : undefined;

      const pending = sequence(lastResult?.get()?.next || sequence());

      let result = runInAction(() => action.do(state));
      while (!result.choice && result.next) {
        result = result.next.do(state);
      }

      lastResult.set({
        ...result,
        next: sequence(
          result.next || sequence(),
          nextTitle ? playerActions(nextTitle) : sequence(),
          pending
        ),
      });

      console.log(toJS(engine.result));
    },
  };

  return engine;
}
