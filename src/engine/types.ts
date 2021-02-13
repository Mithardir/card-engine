import { PlayerId, State } from "./state";

export type CommandResult = "none" | "partial" | "full";

export type Command = {
  print: string;
  do: (state: State) => [State, CommandResult];
};

export type Engine = {
  choosePlayer: (player: PlayerId) => Promise<PlayerId>;
};

export type Action = {
  print: string;
  do: (state: State, engine: Engine) => Promise<State>;
  //do2: (state: State, exec: (cmd: Command) => State) => Promise<void>;
  commands: (state: State) => Array<{ cmd: Command; next: Action[] }>;
};
