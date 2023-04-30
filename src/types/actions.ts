import {
  Side,
  NumberValue,
  PlayerZoneType,
  CardFilter,
  PlayerDeck,
  GameZoneType,
  Phase,
  PlayerFilter,
  Mark,
  PlayerId,
  BoolValue,
  CardId,
  ActionLimit,
} from "./basic";
import { Sphere, CardDefinition } from "./cards";

export type CardAction =
  | "Exhaust"
  | "Ready"
  | "CommitToQuest"
  | "TravelTo"
  | "Discard"
  | {
      type: "Flip";
      side: Side;
    }
  | { type: "AddResources"; amount: NumberValue }
  | { type: "PayResources"; amount: NumberValue }
  | { type: "DealDamage"; amount: NumberValue }
  | { type: "Heal"; amount: NumberValue | "all" }
  | { type: "EngagePlayer"; player: PlayerId }
  | { type: "ResolveEnemyAttacking"; player: PlayerId }
  | { type: "ResolvePlayerAttacking"; player: PlayerId }
  | { type: "Mark"; mark: Mark }
  | { type: "Sequence"; actions: CardAction[] };

export type PlayerAction =
  | "CommitCharactersToQuest"
  | "OptionalEngagement"
  | "EngagementCheck"
  | "ResolveEnemyAttacks"
  | "ResolvePlayerAttacks"
  | "DeclareDefender"
  | "DetermineCombatDamage"
  | { type: "DeclareAttackers"; enemy: CardId }
  | { type: "IncrementThreat"; amount: NumberValue }
  | { type: "Draw"; amount: NumberValue }
  | { type: "ShuffleZone"; zone: PlayerZoneType }
  | { type: "PayResources"; amount: NumberValue; sphere: Sphere | "any" }
  | { type: "Sequence"; actions: PlayerAction[] }
  | {
      type: "ChooseCard";
      multi: boolean;
      optional: boolean;
      label: string;
      action: CardAction;
      filter: CardFilter;
    };

export type GameAction =
  | "RevealEncounterCard"
  | "ResolveQuesting"
  | "ChooseTravelDestination"
  | "PassFirstPlayerToken"
  | "EndPhase"
  | "EndRound"
  | "SetupActions"
  | "DealShadowCards"
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
      filter: CardFilter;
      multi: boolean;
      optional: boolean;
    }
  | {
      type: "ChooseAction";
      label: string;
      options: Array<{ title: string; cardId?: CardId; action: Action }>;
      multi: boolean;
      optional: boolean;
    }
  | { type: "PlaceProgress"; amount: NumberValue }
  | { type: "ClearMarks"; mark: Mark }
  | { type: "AddToStagingArea"; name: string }
  | {
      type: "Limit";
      limit: ActionLimit;
      actionId: string;
      playerId: PlayerId;
    };

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
