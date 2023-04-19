import { Action } from "./actions";
import { CardId, BoolValue, Ability, PlayerId } from "./basic";
import { PrintedProps } from "./cards";
import { CardState, State } from "./state";

export type ActionView = {
  description: string;
  enabled: (player: PlayerId, state: State) => BoolValue;
  action: (caster: PlayerId) => Action;
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
