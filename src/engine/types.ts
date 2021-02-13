import { PlayerId, State } from "./state";

export type CommandResult = "none" | "partial" | "full";

export type Command = {
  print: string;
  do: (state: State) => void;
  result: (state: State) => CommandResult;
};

export type Engine = {
  state: State;
  exec: (command: Command) => void;
  do: (action: Action) => Promise<void>;
  chooseNextAction: (title: string, actions: Array<{ label: string; value: Action }>) => Promise<void>;
};

export type Action = {
  print: string;
  do: (engine: Engine) => Promise<void>;
  commands: (state: State) => Array<{ first: Command; next: Action[] }>;
};

export type Token = "damage" | "resources" | "progress";
