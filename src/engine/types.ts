import { Action2 } from "./actions2";
import { Filter } from "./filters";
import { CardId, GameZoneType, PlayerId, PlayerZoneType, State } from "./state";

export type Engine = {
  state: State;
  do: (action: Action2) => Promise<void>;
  chooseCards: (title: string, filter: Filter<CardId>) => Promise<CardId[]>;
  playerActions: (title: string) => Promise<void>;
  chooseOne: <T>(title: string, options: Array<{ label: string; value: T; image?: string }>) => Promise<T>;
};

export type Token = "damage" | "resources" | "progress";

export type ZoneKey =
  | { type: GameZoneType; player?: never; print: string }
  | { type: PlayerZoneType; player: PlayerId; print: string };
