import { Flavor } from "../utils";
import { PrintedProps } from "./cardprops";
import { View } from "./view";

export const playerIds = ["A", "B", "C", "D"];

export type CardId = Flavor<number, "Card">;

export type PlayerId = Flavor<string, "Player">;

export type GameZoneType =
  | "discardPile"
  | "stagingArea"
  | "quest"
  | "activeLocation"
  | "encounterDeck"
  | "questDeck"
  | "victoryDisplay";

export type PlayerZoneType = "hand" | "library" | "discardPile" | "playerArea" | "engaged";

export type ZoneType = GameZoneType | PlayerZoneType;

export interface PlayerState {
  id: PlayerId;
  zones: Record<PlayerZoneType, ZoneState>;
  thread: number;
}

export type Side = "face" | "back";

export type CardAction = {};

export type CardDefinition = {
  face: PrintedProps;
  back: PrintedProps;
  orientation: "landscape" | "portrait";
};

export interface CardState {
  id: CardId;
  definition: CardDefinition;
  sideUp: Side;
  tapped: boolean;
  damage: number;
  progress: number;
  resources: number;
  attachedTo?: CardId;
  commitedToQuest: boolean;
}

export interface ZoneState {
  stack: boolean;
  cards: CardId[];
}

export type Effect = { modifier: (view: View) => void; until?: "end_of_phase" };

export interface State {
  version: number;
  firstPlayer: PlayerId;
  cards: CardState[];
  players: PlayerState[];
  zones: Record<GameZoneType, ZoneState>;
  effects: Effect[];
}

export type Card = (id: number) => CardDefinition;

export type DeckInfo = {
  cards: Card[];
};

export function createCardState(id: CardId, card: Card, side: Side): CardState {
  return {
    id,
    damage: 0,
    progress: 0,
    resources: 0,
    sideUp: side,
    tapped: false,
    definition: card(id),
    commitedToQuest: false,
  };
}

export function createInitState(): State {
  return {
    version: 0,
    cards: [],
    effects: [],
    firstPlayer: "A",
    players: [],
    zones: {
      activeLocation: { cards: [], stack: false },
      discardPile: { cards: [], stack: true },
      encounterDeck: { cards: [], stack: true },
      quest: { cards: [], stack: false },
      questDeck: { cards: [], stack: true },
      stagingArea: { cards: [], stack: false },
      victoryDisplay: { cards: [], stack: true },
    },
  };
}
