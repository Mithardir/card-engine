import { Filter } from "./filters";
import { Card, CardId, GameZoneType, PlayerId, PlayerZoneType, State } from "./state";

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
  chooseCards: (title: string, filter: Filter<CardId>) => Promise<CardId[]>;
  playerActions: (title: string) => Promise<void>;
};

export type Action = {
  print: string;
  do: (engine: Engine) => Promise<void>;
  commands: (state: State) => Array<{ first: Command; next: Action[] }>;
};

export type Token = "damage" | "resources" | "progress";

export type ZoneKey =
  | { type: GameZoneType; player?: never; print: string }
  | { type: PlayerZoneType; player: PlayerId; print: string };

export type PlayerAction = (playerId: PlayerId) => Action;

export type CardAction = (cardId: CardId) => Action;
