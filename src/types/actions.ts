import {
  BoolValue,
  CardDefinition,
  CardFilter,
  GameZoneType,
  Mark,
  NumberValue,
  Phase,
  PlayerDeck,
  PlayerFilter,
  PlayerZoneType,
  Side,
} from "./basic";

export type CardAction =
  | "Tap"
  | "Untap"
  | {
      type: "Flip";
      side: Side;
    }
  | { type: "AddResources"; amount: NumberValue }
  | { type: "DealDamage"; amount: NumberValue }
  | { type: "Heal"; amount: NumberValue };

export type PlayerAction =
  | { type: "IncrementThreat"; amount: NumberValue }
  | { type: "Draw"; amount: NumberValue }
  | { type: "ShuffleZone"; zone: PlayerZoneType };

export type GameAction =
  | { type: "AddPlayer"; deck: PlayerDeck }
  | {
      type: "AddCard";
      definition: CardDefinition;
      zone: GameZoneType;
      side: Side;
    }
  | { type: "ShuffleZone"; zone: GameZoneType }
  | { type: "PlayerActions"; label: string }
  | { type: "BeginPhase"; phase: Phase }
  | {
      type: "ChoosePlayer";
      label: string;
      action: PlayerAction;
      filter?: PlayerFilter;
    }
  | {
      type: "ChooseCard";
      label: string;
      action: CardAction;
      filter?: CardFilter;
    }
  | { type: "PlaceProgress"; amount: NumberValue }
  | { type: "ClearMarks"; mark: Mark }
  | "RevealEncounterCard"
  | "ResolveQuesting"
  | "ChooseTravelDestination"
  | "PassFirstPlayerToken"
  | "EndPhase"
  | "EndRound"
  | "SetupActions";

export type Action =
  | GameAction
  | {
      type: "CardAction";
      card: CardFilter;
      action: CardAction;
    }
  | {
      type: "PlayerAction";
      player: PlayerFilter;
      action: PlayerAction;
    }
  | { type: "Sequence"; actions: Action[] }
  | {
      type: "IfThenElse";
      condition: BoolValue;
      then: Action;
      else: Action;
    }
  | { type: "While"; condition: BoolValue; action: Action }
  | { type: "Repeat"; amount: NumberValue; action: Action }
  | "Empty";
