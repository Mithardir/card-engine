import { Exp } from "../exps";
import { State } from "../state";
import { createView } from "../view";
import { Action } from "./types";

export function action(title: string, update: (state: State) => void): Action {
  return {
    print: title,
    do: (state) => {
      update(state);
      return {
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
          choice: undefined,
          next: undefined,
        };
      }

      const result = actions[0].do(state);

      if (actions.length === 1) {
        return result;
      } else {
        return {
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
          next: result.next ? sequence(result.next, whileDo(exp, action)) : whileDo(exp, action),
          choice: result.choice,
        };
      } else {
        return {
          choice: undefined,
          next: undefined,
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
      return sequence(cost, effect).do(s);
    },
  };
}
