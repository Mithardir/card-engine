import { Action } from "./actions";
import { CardId, BoolValue, Ability, PlayerId } from "./basic";
import { PrintedProps } from "./cards";
import { Events } from "./events";
import { CardState, State } from "./state";

export type ActionView = {
  description: string;
  enabled: (player: PlayerId, state: State) => BoolValue;
  action: (caster: PlayerId) => Action;
};

export type ResponseView<T extends keyof Events> = {
  description: string;
  response: {
    type: T;
    condition: (e: Events[T], self: CardId) => BoolValue;
    action: (e: Events[T], self: CardId) => Action;
  };
};

export type CardView = {
  props: PrintedProps;
  setup: Action[];
  actions: Array<ActionView>;
  responses: {
    receivedDamage: Array<ResponseView<"receivedDamage">>;
  };
  abilities: Array<{ applied: boolean; ability: Ability }>;
} & CardState;

export type View = {
  cards: Record<CardId, CardView>;
};
