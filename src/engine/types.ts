import { PlayerId, State } from "./state";

export type CommandResult = "none" | "partial" | "full";

export type Command = {
  print: string;
  do: (state: State) => [State, CommandResult];
};

export type Engine = {
  exec: (command: Command) => void;
  do: (action: Action) => Promise<void>;
  choosePlayer: (player: PlayerId) => Promise<PlayerId>;
};

export type Action = {
  print: string;
  do: (engine: Engine) => Promise<void>;
  //do2: (state: State, exec: (cmd: Command) => State) => Promise<void>;
  results: (state: State) => Array<[State, CommandResult]>;
  choices: (state: State) => State[];
  commands: (state: State) => Array<{ first: Command; next: Action[] }>;
};
