import { State } from "../state";
import { sequence } from "./control";
import { Action, ActionEffect, StateTree } from "./types";

export function getActionChange(action: Action, state: State): ActionEffect {
  const result = action.do(state);

  if (result.choice) {
    const results = result.choice.choices.map((c) => {
      return getActionChange(c.action, state);
    });

    return mergeEffect("and", result.effect, mergeEffect("or", ...results));
  } else {
    if (result.next) {
      return mergeEffect("and", result.effect, getActionChange(result.next, state));
    } else {
      return result.effect;
    }
  }
}

export function mergeEffect(type: "and" | "or", ...effects: ActionEffect[]): ActionEffect {
  if (effects.every((e) => e === "none")) {
    return "none";
  }

  if (type === "or" && effects.some((e) => e === "full")) {
    return "full";
  }

  if (type === "and" && effects.every((e) => e === "full")) {
    return "full";
  }

  return "partial";
}

export function getStateTree(state: State, action: Action): StateTree {
  const result = action.do(state);

  if (!result.choice) {
    if (!result.next) {
      return {
        state: result.state,
        next: undefined,
      };
    } else {
      return getStateTree(result.state, result.next);
    }
  } else {
    return {
      state: result.state,
      next: {
        title: result.choice.title,
        choices: result.choice.choices
          .filter((c) => getActionChange(c.action, result.state) !== "none")
          .map((c) => {
            return {
              label: c.label,
              get result() {
                const next = result.next ? result.next : sequence();
                return getStateTree(result.state, sequence(c.action, next));
              },
            };
          }),
      },
    };
  }
}
