import { State } from "./state";

export type CommandResult = "none" | "partial" | "full";

export type Command = {
  print: string;
  do: (state: State) => [State, CommandResult];
};

export type Action = {
  print: string;
  do: (state: State) => Promise<State>;
  choices: Tree<Command>;
  simulate: (state: State) => [State, CommandResult][];
};

export type Tree<T> =
  | {
      item: T;
      children?: never;
    }
  | {
      item?: never;
      children: Tree<T>[];
    };
