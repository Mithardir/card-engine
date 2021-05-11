import produce from "immer";
import { Exp } from "../exps";
import { State } from "../state";
import { createView } from "../view";
import { ActionEffect, Action } from "./types";
import { getActionChange, noChange } from "./utils";

export function action(title: string, update: (state: State) => ActionEffect): Action {
  return {
    print: title,
    do: (state) => {
      let change: ActionEffect = "none";
      const newState = produce(state, (draft) => {
        change = update(draft);
      });
      return {
        effect: change,
        state: newState,
        choice: undefined,
        next: undefined,
      };
    },
  };
}

export function sequence(...actions: Action[]): Action {
  return {
    print:
      actions.length === 0
        ? ""
        : `(${actions
            .map((a) => a.print)
            .filter((a) => a)
            .join(", ")})`,
    do: (state) => {
      if (actions.length === 0) {
        return {
          effect: "full",
          choice: undefined,
          next: undefined,
          state,
        };
      }

      const result = actions[0].do(state);

      if (actions.length === 1) {
        return result;
      } else {
        return {
          effect: result.effect,
          state: result.state,
          choice: result.choice
            ? {
                ...result.choice,
                choices: result.choice.choices.map((c) => ({
                  ...c,
                  action: c.action,
                })),
              }
            : undefined,
          next: result.next ? sequence(result.next, ...actions.slice(1)) : sequence(...actions.slice(1)),
        };
      }
    },
  };
}

export function whileDo(exp: Exp<boolean>, action: Action): Action {
  return {
    print: `whileDo(${exp.print}, ${action.print})`,
    do: (state) => {
      if (exp.eval(createView(state))) {
        const result = action.do(state);

        return {
          state: result.state,
          next: result.next ? sequence(result.next, whileDo(exp, action)) : whileDo(exp, action),
          effect: result.effect,
          choice: result.choice,
        };
      } else {
        return {
          effect: "none",
          choice: undefined,
          next: undefined,
          state,
        };
      }
    },
  };
}

export function bind<T>(exp: Exp<T>, factory: (v: T) => Action): Action {
  return {
    // TODO x
    print: factory("x" as any).print,
    do: (state) => {
      const value = exp.eval(createView(state));
      const action = factory(value);
      return action.do(state);
    },
  };
}

export function repeat(amount: number, action: Action): Action {
  return {
    print: `repeat(${amount}, ${action.print})`,
    do: (s) => {
      return sequence(...Array.from(new Array(amount)).map((_) => action)).do(s);
    },
  };
}

export function pay(cost: Action, effect: Action): Action {
  return {
    print: `pay(${cost}, ${effect})`,
    do: (s) => {
      const paymentResult = getActionChange(cost, s);
      if (paymentResult !== "full") {
        return noChange(s);
      } else {
        return sequence(cost, effect).do(s);
      }
    },
  };
}
