import { observable } from "mobx";
import { Flavor } from "../utils";
import { PrintedProps } from "./types";
import { createView, View } from "./view";

export const playerIds: PlayerId[] = ["A", "B", "C", "D"];

export type CardId = Flavor<number, "Card">;

export type PlayerId = "A" | "B" | "C" | "D";

export type GameZoneType =
  | "discardPile"
  | "stagingArea"
  | "quest"
  | "activeLocation"
  | "encounterDeck"
  | "questDeck"
  | "victoryDisplay";

export type PlayerZoneType =
  | "hand"
  | "library"
  | "discardPile"
  | "playerArea"
  | "engaged";

export type ZoneType = GameZoneType | PlayerZoneType;

export interface PlayerState {
  id: PlayerId;
  zones: Record<PlayerZoneType, ZoneState>;
  thread: number;
}

export type Side = "face" | "back";

export type CardDefinition = {
  face: PrintedProps;
  back: PrintedProps;
  orientation: "landscape" | "portrait";
};

export type Token = "damage" | "progress" | "resources";

export type Mark = "questing" | "attacking" | "defending" | "attacked";

export type Tokens = Record<Token, number>;

export type Marks = Record<Mark, boolean>;

export interface CardState {
  id: CardId;
  definition: CardDefinition;
  sideUp: Side;
  tapped: boolean;
  token: Tokens;
  mark: Marks;
  attachedTo?: CardId | undefined;
}

export interface ZoneState {
  stack: boolean;
  cards: CardId[];
}

export type Effect = { modifier: (view: View) => void; until?: "end_of_phase" };

export type Phase =
  | "setup"
  | "resource"
  | "planning"
  | "quest"
  | "travel"
  | "encounter"
  | "combat"
  | "refresh";

export interface State {
  version: number;
  phase: Phase;
  firstPlayer: PlayerId;
  cards: CardState[];
  players: Partial<Record<PlayerId, PlayerState>>;
  zones: Record<GameZoneType, ZoneState>;
  effects: Effect[];
  view: View;
}

export function createCardState(
  id: CardId,
  definition: CardDefinition,
  side: Side
): CardState {
  return {
    id,
    token: {
      damage: 0,
      progress: 0,
      resources: 0,
    },
    mark: {
      questing: false,
      attacking: false,
      defending: false,
      attacked: false,
    },
    sideUp: side,
    tapped: false,
    definition,
  };
}

export function createInitState(): State {
  const state: State = observable({
    version: 0,
    cards: [],
    effects: [],
    phase: "setup",
    firstPlayer: "A",
    players: {},
    zones: {
      activeLocation: { cards: [], stack: false },
      discardPile: { cards: [], stack: true },
      encounterDeck: { cards: [], stack: true },
      quest: { cards: [], stack: false },
      questDeck: { cards: [], stack: true },
      stagingArea: { cards: [], stack: false },
      victoryDisplay: { cards: [], stack: true },
    },
    get view(): View {
      return createView(state);
    },
  });

  return state;
}
