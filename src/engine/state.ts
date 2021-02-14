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
  };
}

export function createInitState(...decks: DeckInfo[]): State {
  let id = 1;

  const players: Array<{ player: PlayerState; cards: CardState[] }> = decks.map((p, index) => {
    const cards: CardState[] = p.cards.map((f) => {
      const cardId = id++;
      return {
        id: cardId,
        damage: 0,
        progress: 0,
        resources: 0,
        sideUp: "back",
        tapped: false,
        definition: f(cardId),
      };
    });

    return {
      player: {
        id: playerIds[index],
        thread: 0,
        zones: {
          hand: { cards: [], stack: false },
          library: { cards: cards.map((c) => c.id), stack: true },
          playerArea: { cards: [], stack: false },
          discardPile: { cards: [], stack: true },
          engaged: { cards: [], stack: false },
        },
      },
      cards,
    };
  });

  return {
    version: 0,
    cards: players.flatMap((p) => p.cards),
    effects: [],
    firstPlayer: "A",
    players: players.map((p) => p.player),
    zones: {
      activeLocation: { cards: [], stack: false },
      discardPile: { cards: [], stack: true },
      encounterDeck: { cards: [], stack: false },
      quest: { cards: [], stack: false },
      questDeck: { cards: [], stack: true },
      stagingArea: { cards: [], stack: false },
      victoryDisplay: { cards: [], stack: true },
    },
  };
}
