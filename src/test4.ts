import produce, { Immer } from "immer";

type State = { a: number; b: number };

const incA = simpleAction("incA", (s) => {
  s.a += 1;
  return "full";
});

const incB = simpleAction("incB", (s) => {
  s.b += 1;
  return "full";
});

const decA = simpleAction("decA", (s) => {
  if (s.a >= 1) {
    s.a -= 1;
    return "full";
  } else {
    return "none";
  }
});

const decB = simpleAction("decB", (s) => {
  if (s.b >= 1) {
    s.b -= 1;
    return "full";
  } else {
    return "none";
  }
});

function chooseOne(title: string, actions: Action2[]): Action2 {
  return {
    type: "action",
    print: `choose one [${actions.map((a) => a.print).join(", ")}]`,
    do: (state) => {
      return {
        change: mergeOrResults(actions.map((a) => getActiomChange(a, state))),
        state: state,
        next: {
          type: "action_choice",
          title,
          choices: actions.map((a) => ({ action: a, image: "", label: a.print })),
        },
      };
    },
  };
}

const s: State = { a: 3, b: 1 };

console.log(s);
console.log(incA.do(s));
console.log(sequence2([chooseOne("a/b", [decA, decB]), decA, decB]).do(s));

const flow = sequence2([chooseOne("x", [decA, chooseOne("a/b", [decA, decB])]), decA]);

const flow2 = sequence2([chooseOne("a/b", [decA, decB]), chooseOne("a/b", [decA, decB])]);

//console.log(expandNextActions(s, flow));

//console.log(JSON.stringify(getStateTree(s, flow2), null, 1));

export const flow3 = whileDo((s) => s.a > 0 || s.b > 0, chooseOne("a/b", [decA, decB]));

//const tree = getStateTree(s, flow3);

//console.log(tree);

export function whileDo(exp: (state: State) => boolean, action: Action2): Action2 {
  return {
    print: "while do",
    type: "action",
    do: (state) => {
      if (exp(state)) {
        const result = action.do(state);
        if (!result.next) {
          return {
            change: result.change,
            next: result.next,
            state: result.state,
          };
        }

        if (result.next.type === "action") {
          return {
            change: result.change,
            next: sequence2([result.next, whileDo(exp, action)]),
            state: result.state,
          };
        }

        if (result.next.type === "action_choice") {
          return {
            change: result.change,
            next: {
              ...result.next,
              choices: result.next.choices.map((c) => ({ ...c, action: sequence2([c.action, whileDo(exp, action)]) })),
            },
            state: result.state,
          };
        }
      }

      return { state, change: "none", next: undefined };
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
  debugger;
  const result = action.do(state);
  if (!result.next) {
    return {
      state: result.state,
      next: undefined,
    };
  }

  if (result.next.type === "action") {
    return getStateTree(result.state, result.next);
  } else {
    return {
      state: result.state,
      next: {
        title: result.next.title,
        choices: result.next.choices
          .filter((c) => getActiomChange(c.action, result.state) !== "none")
          .map((c) => ({
            label: c.label,
            get result() {
              return getStateTree(result.state, c.action);
            },
          })),
      },
    };
  }
}

export function simpleAction(title: string, update: (state: State) => CommandResult): Action2 {
  return {
    type: "action",
    print: title,
    do: (state) => {
      let change: CommandResult = "none";
      const newState = produce(state, (draft) => {
        change = update(draft);
      });
      return {
        change,
        state: newState,
        next: undefined,
      };
    },
  };
}

export function sequence2(actions: Action2[]): Action2 {
  return {
    type: "action",
    print: `sequence: \r\n${actions.map((a) => "\t" + a.print).join("\r\n")}`,
    do: (state) => {
      if (actions.length === 0) {
        return {
          change: "none",
          next: undefined,
          state,
        };
      }

      const result = actions[0].do(state);

      if (actions.length === 1) {
        return result;
      } else {
        if (!result.next) {
          return {
            change: result.change,
            state: result.state,
            next: sequence2(actions.slice(1)),
          };
        } else if (result.next.type === "action") {
          return { change: result.change, state: result.state, next: sequence2([result.next, ...actions.slice(1)]) };
        } else {
          return {
            change: result.change,
            state: result.state,
            next: {
              type: "action_choice",
              title: result.next.title,
              choices: result.next.choices.map((c) => ({ ...c, action: sequence2([c.action, ...actions.slice(1)]) })),
            },
          };
        }
      }
    },
  };
}

export function getActiomChange(action: Action2, init: State): CommandResult {
  const result = action.do(init);
  if (!result.next) {
    return result.change;
  } else if (result.next.type === "action") {
    return mergeAndResults(result.change, getActiomChange(result.next, init));
  } else {
    const results = result.next.choices.map((c) => {
      return getActiomChange(c.action, init);
    });
    return mergeAndResults(result.change, mergeOrResults(results));
  }
}

export function mergeOrResults(results: CommandResult[]): CommandResult {
  if (results.some((c) => c === "full")) {
    return "full";
  }

  if (results.every((c) => c === "none")) {
    return "none";
  }

  return "partial";
}

export function mergeAndResults(...results: CommandResult[]): CommandResult {
  if (results.every((c) => c === "full")) {
    return "full";
  }

  if (results.every((c) => c === "none")) {
    return "none";
  }

  return "partial";
}

export type Action2 = {
  print: string;
  type: "action";
  do: (state: State) => ActionResult;
};

export type ActionResult = {
  state: State;
  change: CommandResult;
  next: Action2 | ActionChoice | undefined;
};

export type ActionChoice = {
  type: "action_choice";
  title: string;
  choices: Array<{ label: string; image: string; action: Action2 }>;
};

export type CommandResult = "none" | "partial" | "full";
