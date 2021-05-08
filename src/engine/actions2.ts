import produce from "immer";
import { moveTopCard, repeat, zoneKey } from "./commands";
import { Exp } from "./filters";
import { CardId, PlayerId, State } from "./state";
import { createView } from "./view";

export function chooseOne(title: string, actions: Action2[]): Action2 {
  return {
    print: `choose one [${actions.map((a) => a.print).join(", ")}]`,
    do: (state) => {
      return {
        effect: mergeEffect("or", ...actions.map((a) => getActionChange(a, state))),
        state: state,
        choice: {
          title,
          multiple: false,
          dialog: true,
          choices: actions.map((a) => ({ action: a, image: "", label: a.print })),
        },
        next: undefined,
      };
    },
  };
}

export function chooseSome(
  title: string,
  choices: Array<{ label: string; image?: string; action: Action2 }>
): Action2 {
  return {
    print: `choose one [${choices.map((a) => a.action.print).join(", ")}]`,
    do: (state) => {
      return {
        effect: mergeEffect("or", ...choices.map((c) => getActionChange(c.action, state))),
        state: state,
        choice: {
          title,
          multiple: true,
          dialog: true,
          choices: choices.map((c) => ({ action: c.action, image: c.image, label: c.label })),
        },
        next: undefined,
      };
    },
  };
}

export function whileDo(exp: Exp<boolean>, action: Action2): Action2 {
  return {
    print: `while (${exp.print}) do {${action.print}}`,
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

export type StateTree = {
  state: State;
  next?: {
    title: string;
    choices: Array<{
      label: string;
      result: StateTree;
    }>;
  };
};

export function getStateTree(state: State, action: Action2): StateTree {
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

export function action(title: string, update: (state: State) => ActionEffect): Action2 {
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

export function sequence(...actions: Action2[]): Action2 {
  return {
    print: `sequence: ${actions.map((a) => a.print).join(",")}`,
    do: (state) => {
      if (actions.length === 0) {
        return {
          effect: "none",
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
                choices: result.choice.choices.map((c) => ({ ...c, action: c.action })),
              }
            : undefined,
          next: result.next ? sequence(result.next, ...actions.slice(1)) : sequence(...actions.slice(1)),
        };
      }
    },
  };
}

export function getActionChange(action: Action2, state: State): ActionEffect {
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

export type Action2 = {
  print: string;
  do: (state: State) => ActionResult;
};

export type ActionResult = {
  state: State;
  effect: ActionEffect;
  choice:
    | {
        title: string;
        multiple: boolean;
        dialog: boolean;
        choices: Array<{ label: string; image?: string; action: Action2 }>;
      }
    | undefined;
  next: Action2 | undefined;
};

export type ActionEffect = "none" | "partial" | "full";

export type PlayerAction = (playerId: PlayerId) => Action2;

export type CardAction = (cardId: CardId) => Action2;

export const draw = (amount: number) => (playerId: PlayerId) =>
  repeat(amount, moveTopCard(zoneKey("library", playerId), zoneKey("hand", playerId), "face"));

export const playerActions: (title: string) => Action2 = (title) => {
  return {
    print: `player actions until ${title}`,
    do: (state) => {
      return {
        choice: {
          title,
          multiple: true,
          dialog: false,
          choices: [], // TODO choices
        },
        effect: "full",
        state,
        next: undefined,
      };
    },
  };
};
