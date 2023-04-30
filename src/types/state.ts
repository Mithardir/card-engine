import { Action } from "./actions";
import {
  Phase,
  PlayerId,
  GameZoneType,
  CardId,
  PlayerZoneType,
  Side,
  Marks,
  Tokens,
  ActionLimit,
} from "./basic";
import { CardDefinition } from "./cards";

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
  round: number;
  phase: Phase;
  firstPlayer: PlayerId;
  effects: Array<{ description: string }>;
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
  limits: Array<{
    actionId: string;
    limit: ActionLimit;
    used: PlayerId[];
  }>;
};
