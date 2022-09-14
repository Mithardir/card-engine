import { View, State, PlayerId, CardId } from "../types/state";

export type Effect = {
  description: string;
  apply: (view: View) => View;
};

export type Action = {
  print: string;
  apply: (state: State) => void;
};

export type Getter<T> = {
  print: string;
  get: (state: State) => T | undefined;
};

export type PlayerAction = {
  print: string;
  player: (playerId: PlayerId) => Action;
};

// todo remove
export type CardFilter = { print: string };

export type CardAction = {
  print: string;
  card: (cardId: CardId | Getter<CardId>) => Action;
};

export type Predicate<T> = {
  print: string;
  eval: (item: T, state: State) => boolean;
};

export type Response<T> = {
  description: string;
  create: (e: T) => Action;
};
