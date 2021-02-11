import memoizee from "memoizee";

console.log("A");

type S = { a: number; b: number };

type V = S & { c: number };

const view: (s: S) => V = memoizee((s: S) => {
  console.log("X");
  return { ...s, c: s.a + s.b };
});

type Action = {
  print: string;
  do: (state: S) => Promise<S>;
  results: (state: S) => S[];
};

type Command = {
  print: string;
  do: (state: S) => [S, CommandResult];
};

type CommandResult = "none" | "partial" | "full";

const addA1C: Command = {
  print: "addA1",
  do: (s) => [{ ...s, a: s.a + 1 }, "full"],
};

const subA1C: Command = {
  print: "subA1",
  do: memoizee((s) => {
    const v = view(s);
    console.log("X");
    if (v.c > 0) {
      return [{ ...s, a: s.a - 1 }, "full"];
    } else {
      return [s, "none"];
    }
  }),
};

function simpleAction(cmd: Command): Action {
  return {
    print: cmd.print,
    do: async (s) => cmd.do(s)[0],
    results: (s) => [cmd.do(s)[0]],
  };
}

function mergeCommandResults(results: CommandResult[]): CommandResult {
  if (results.every((c) => c === "full")) {
    return "full";
  }

  if (results.every((c) => c === "none")) {
    return "none";
  }

  return "partial";
}

function sequence(...cmds: Command[]): Command {
  return {
    print: `sequence(${cmds.map((c) => c.print).join(", ")})`,
    do: (init) => {
      let state = init;
      const results: CommandResult[] = [];
      for (const cmd of cmds) {
        const result = cmd.do(state);
        state = result[0];
        results.push(result[1]);
      }

      return [state, mergeCommandResults(results)];
    },
  };
}

const addA1: Action = simpleAction(addA1C);
const subA1: Action = simpleAction(subA1C);

const state: S = { a: 0, b: 3 };

const sub5 = sequence(sequence(subA1C, subA1C), sequence(subA1C, subA1C));
console.log(sub5.print);

const s1 = state;
const s2 = subA1.results(state)[0];

console.log(s1 === s2);

console.log(sub5.do(state));
