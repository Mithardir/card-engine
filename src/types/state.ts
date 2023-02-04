import { Action } from "./actions";
import {
  Phase,
  PlayerId,
  GameZoneType,
  CardId,
  CardDefinition,
  PlayerZoneType,
  Side,
  Marks,
  Tokens,
  PrintedProps,
  BoolValue,
  Ability,
} from "./basic";

export type CardState = {
  id: CardId;
  definition: CardDefinition;
  sideUp: Side;
  tapped: boolean;
  token: Tokens;
  mark: Marks;
  attachments: CardId[];
  owner: PlayerId | "game";
  controller: PlayerId | "game";
};

export type ActionView = {
  enabled: BoolValue;
  action: Action;
};

export type CardView = {
  props: PrintedProps;
  setup?: Action;
  actions: Array<ActionView>;
  abilities: Array<{ applied: boolean; ability: Ability }>;
} & CardState;

export type View = {
  cards: Record<CardId, CardView>;
};

export type PlayerState = {
  id: PlayerId;
  zones: Record<PlayerZoneType, ZoneState>;
  thread: number;
};

export type ZoneState = {
  stack: boolean;
  cards: CardId[];
};

export type State = {
  phase: Phase;
  players: Partial<Record<PlayerId, PlayerState>>;
  zones: Record<GameZoneType, ZoneState>;
  cards: Record<CardId, CardState>;
  triggers: {
    end_of_phase: Action[];
    end_of_round: Action[];
  };
  choice?: {
    title: string;
    dialog: boolean;
    multi: boolean;
    options: Array<{ title: string; action: Action; image?: string }>;
  };
  next: Action[];
  result?: "win" | "lost";
  flags: Record<string, any>;
  nextId: CardId;
};
