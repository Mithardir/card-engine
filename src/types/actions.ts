import {
  BoolValue,
  CardDefinition,
  CardFilter,
  GameZoneType,
  NumberValue,
  Phase,
  PlayerDeck,
  PlayerFilter,
  PlayerZoneType,
  Side,
} from "./basic";

export type CardAction =
  | {
      type: "flip";
      side: Side;
    }
  | { type: "AddResources"; amount: NumberValue };

export type PlayerAction =
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
  | "EndPhase"
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
  | "Empty";
