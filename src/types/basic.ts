import { Action, PlayerAction } from "./actions";
import { Events } from "./events";
import { CardDefinition, Keywords, Sphere } from "./cards";
import { CardNumberProp } from "../factories/cardModifiers";

export interface Flavoring<FlavorT> {
  _type?: FlavorT;
}

export type Scenario = {
  name: string;
  questCards: CardDefinition[];
  encounterCards: CardDefinition[];
};

export type PlayerDeck = {
  name: string;
  heroes: CardDefinition[];
  library: CardDefinition[];
};

export const playerIds = ["A", "B", "C", "D"] as const;

export type PlayerId = "A" | "B" | "C" | "D";

export type CardId = Flavor<number, "Card">;

export type Flavor<T, FlavorT> = T & Flavoring<FlavorT>;

export type Phase =
  | "setup"
  | "resource"
  | "planning"
  | "quest"
  | "travel"
  | "encounter"
  | "combat"
  | "refresh";

export type Token = "damage" | "progress" | "resources";

export type CardType =
  | "hero"
  | "ally"
  | "quest"
  | "attachment"
  | "enemy"
  | "event"
  | "treachery"
  | "location"
  | "quest";

export type CardNumProperty =
  | "attack"
  | "defense"
  | "hitpoints"
  | "willpower"
  | "threat";

export type Mark = "questing" | "attacked" | "attacking" | "defending";

export type CharacterActionAbility = {
  type: "CharacterAction";
  description: string;
  caster?: "controller" | "any";
  limit?: ActionLimit;
  cost: (caster: PlayerId, self: CardId) => Action;
  effect: Action | ((caster: PlayerId, self: CardId) => Action);
};

export type EventActionAbility = {
  type: "EventAction";
  description: string;
  effect: Action;
};

export type ModifySelfAbility = {
  type: "ModifySelf";
  description: string;
  modifier: (self: CardId) => CardModifier;
};

export type KeywordAbility = {
  type: "Keyword";
  keyword: keyof Keywords;
};

export type SetupAbility = {
  type: "Setup";
  description: string;
  action: Action;
};

export type Ability =
  | ModifySelfAbility
  | KeywordAbility
  | CharacterActionAbility
  | EventActionAbility
  | SetupAbility
  | ResponseAbility<"cardReveladed">
  | ResponseAbility<"enemyDestroyed">
  | ResponseAbility<"receivedDamage">;

export type ResponseAbility<T extends keyof Events> = {
  type: "Response";
  description: string;
  response: {
    type: T;
    condition: (e: Events[T], self: CardId) => BoolValue;
    action: (e: Events[T], self: CardId) => Action;
  };
};

export type CardModifier = {
  type: "increment";
  property: CardNumberProp;
  amount: NumberValue;
};

export type Zone =
  | {
      owner: "game";
      type: GameZoneType;
    }
  | { owner: PlayerId; type: PlayerZoneType };

export type CardFilter =
  | CardPredicate
  | CardId
  | CardId[]
  | { type: "TopCard"; zone: Zone };

export type PlayerFilter = PlayerPredicate | PlayerId | PlayerId[];

export type CardPredicate =
  | "isReady"
  | "isTapped"
  | "inPlay"
  | "isCharacter"
  | "isHero"
  | "isAlly"
  | "inHand"
  | "inStagingArea"
  | "isEnemy"
  | { type: "HasResources"; amount: number }
  | { type: "IsInZone"; zone: Zone }
  | { type: "HasMark"; mark: Mark }
  | { type: "HasSphere"; sphere: Sphere }
  | { type: "HasController"; player: PlayerId }
  | { type: "and"; values: CardPredicate[] }
  | { type: "not"; value: CardPredicate };

export type PlayerPredicate =
  | "active"
  | "first"
  | { type: "and"; predicates: PlayerPredicate[] }
  | { type: "or"; predicates: PlayerPredicate[] };

export type Side = "face" | "back";

export type GameZoneType =
  | "discardPile"
  | "stagingArea"
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

export type BoolValue =
  | boolean
  | "GameFinished"
  | "EnemiesToEngage"
  | { type: "IsLess"; a: NumberValue; b: NumberValue }
  | { type: "IsMore"; a: NumberValue; b: NumberValue }
  | { type: "And"; values: BoolValue[] }
  | { type: "Or"; values: BoolValue[] }
  | { type: "Not"; value: BoolValue }
  | { type: "CardBoolValue"; card: CardId; predicate: CardPredicate }
  | { type: "PlayerBoolValue"; player: PlayerId; predicate: PlayerPredicate }
  | { type: "SomeCard"; predicate: CardPredicate };

export type CardNumberValue = "damage" | "defense";

export type NumberValue =
  | number
  | "countOfPlayers"
  | { type: "CardNumberValue"; card: CardId; property: CardNumberValue };

export type Tokens = Record<Token, number>;

export type Marks = Record<Mark, boolean>;

export type ActionLimit = {
  type: "phase" | "round" | "game";
  limit: number;
  byPlayer: boolean;
};
