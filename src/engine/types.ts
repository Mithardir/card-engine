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
  chooseNextAction: (title: string, actions: Array<{ label: string; value: Action; image?: string }>) => Promise<void>;
  chooseNextActions: (title: string, actions: Array<{ label: string; value: Action; image?: string }>) => Promise<void>;
  chooseCards: (title: string, filter: Filter<CardId>) => Promise<CardId[]>;
  playerActions: (title: string) => Promise<void>;
  chooseOne: <T>(title: string, options: Array<{ label: string; value: T; image?: string }>) => Promise<T>;
};

export type Action = {
  print: string;
  do: (engine: Engine) => Promise<void>;
  commands: (state: State) => Array<{ first: Command; next: Action[] }>;
};

export type CardAction2 = {
  type: "card_action";
  print: string;
  action: (cardId: CardId) => Action;
};

export function cardAction(print: string, action: (cardId: CardId) => Action): CardAction2 {
  return { type: "card_action", print, action };
}

export type Token = "damage" | "resources" | "progress";

export type ZoneKey =
  | { type: GameZoneType; player?: never; print: string }
  | { type: PlayerZoneType; player: PlayerId; print: string };

export type PlayerAction = (playerId: PlayerId) => Action;

export type CardAction = (cardId: CardId) => Action;
