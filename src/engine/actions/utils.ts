import { State } from "../state";
import { sequence } from "./control";
import { Action, ActionEffect, ActionResult, StateTree } from "./types";
import { sample } from "lodash";
import st from "stacktrace-js";

export function getActionChange(action: Action, state: State): ActionEffect {
  // const stack = st.getSync({ filter: (f) => f.functionName === "getActionChange" });
  // if (stack.length > 10) {
  //   debugger;
  // }

  const result = action.do(state);

  if (result.choice) {
    // TODO skip player actions

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
  if (effects.length === 0) {
    return type === "and" ? "full" : "none";
  }

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

export function checkEndCondition(state: State): "win" | "loose" | undefined {
  // TODO all checks
  if (state.players.some((p) => p.thread >= 50)) {
    return "loose";
  }

  if (state.players.some((p) => p.zones.playerArea.cards.length === 0)) {
    return "loose";
  }

  if (state.cards.some((c) => c.token.progress > 5)) {
    return "win";
  }
}

export function playRandomlyUntilEnd(state: State, action: Action): [State, "win" | "loose"] {
  const result = action.do(state);
  const end = checkEndCondition(result.state);
  if (end) {
    return [result.state, end];
  }

  if (!result.choice) {
    if (!result.next) {
      debugger;
      throw new Error("out of options");
    } else {
      return playRandomlyUntilEnd(result.state, result.next);
    }
  } else {
    const choosen = sample(result.choice.choices)!;
    return playRandomlyUntilEnd(result.state, result.next ? sequence(choosen.action, result.next) : choosen.action);
  }
}

export function getStateTree(state: State, action: Action): StateTree {
  const result = action.do(state);

  const end = checkEndCondition(state);
  if (end) {
    return {
      state,
      next: undefined,
    };
  }

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
        choices: result.choice.choices.map((c) => {
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

export function noChange(state: State): ActionResult {
  return {
    effect: "none",
    choice: undefined,
    next: undefined,
    state,
  };
}
