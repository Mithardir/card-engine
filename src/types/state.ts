import { Property } from "../cards/definitions/test";
import { Ability } from "../cards/sets/core/quests";
import { Effect, Action, Getter, Predicate } from "../engine/types";
import {
  GameZoneType,
  Marks,
  Phase,
  PlayerZoneType,
  Side,
  Tokens,
} from "./basic";
import { PrintedProps } from "./cards";
import { Flavor } from "./utils";

export type State = {
  phase: Phase;
  players: Partial<Record<PlayerId, PlayerState>>;
  zones: Record<GameZoneType, ZoneState>;
  cards: Record<CardId, CardState>;
  effects: Effect[];
  choice?: {
    title: string;
    dialog: boolean;
    multi: boolean;
    options: Array<{ title: string; action: Action }>;
  };
  next: Action[];
  responses: {};
};

export type View = {
  cards: Record<CardId, CardView>;
};

export const playerIds: PlayerId[] = ["A", "B", "C", "D"];

export type PlayerId = "A" | "B" | "C" | "D";

export type AbilityView = Ability & { applied: boolean };

export type CardId = Flavor<number, "Card">;

export type PlayerState = {
  id: PlayerId;
  zones: Record<PlayerZoneType, ZoneState>;
  thread: number;
};

export type ZoneState = {
  stack: boolean;
  cards: CardId[];
};

export type CardDefinition = {
  face: PrintedProps;
  back: PrintedProps;
  orientation: "landscape" | "portrait";
};

export type CardState = {
  id: CardId;
  definition: CardDefinition;
  sideUp: Side;
  tapped: boolean;
  token: Tokens;
  mark: Marks;
  attachedTo?: CardId | undefined;
};

export type CardView = {
  id: CardId;
  props: PrintedProps;
  abilities: AbilityView[];
  setup: Action[];
  actions: Array<{
    title: string;
    action: Action;
    canRun: Predicate<State>;
  }>;
};
