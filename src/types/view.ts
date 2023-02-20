import { Action } from "./actions";
import { CardId, BoolValue, Ability } from "./basic";
import { PrintedProps } from "./cards";
import { CardState } from "./state";

export type ActionView = {
  enabled: BoolValue;
  action: Action;
};

export type CardView = {
  props: PrintedProps;
  setup: Action[];
  actions: Array<ActionView>;
  abilities: Array<{ applied: boolean; ability: Ability }>;
} & CardState;

export type View = {
  cards: Record<CardId, CardView>;
};
