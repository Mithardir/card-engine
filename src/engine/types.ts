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
  commands: (state: State) => Array<{ cmd: Command; next: Action[] }>;
};
