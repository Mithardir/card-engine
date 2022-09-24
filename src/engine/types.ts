import { View, State, PlayerId, CardId } from "../types/state";
import { isInPlay } from "./filters";

export type Until = "end_of_phase" | "end_of_round";

export type Effect = {
  description: string;
  apply: (view: View, state: State) => void;
  until?: Until;
};

export type Action = {
  print: string;
  apply: (state: State) => void;
  result?: (state: State) => "none" | "partial" | "full";
};

export type Getter<T> = {
  print: string;
  get: (state: State) => T;
};

export type PlayerAction = {
  print: string;
  player: (playerId: PlayerId | undefined) => Action;
};

// todo remove
export type CardFilter = { print: string };

export type CardAction = {
  print: string;
  card: (cardId: CardId | Getter<CardId | undefined> | undefined) => Action;
};

export type Predicate<T> = {
  print: string;
  eval: (item: T, state: State) => boolean;
};

export type Response<T> = {
  description: string;
  create: (e: T) => Action;
};
