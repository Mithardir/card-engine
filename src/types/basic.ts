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

export type Ability = {
  type: "ModifySelf";
  description: string;
  modifier: (self: CardId) => CardModifier;
};

export type CardModifier = {
  type: "increment";
  property: "attack";
  amount: NumberValue;
};

export type CommonProps = {
  image: string;
  traits?: Trait[];
  keywords?: Keywords;
  abilities?: Ability[];
};

export type PrintedProps = CommonProps &
  Partial<{
    name: string;
    cost: number;
    unique: boolean;
    threatCost: number;
    willpower: number;
    attack: number;
    defense: number;
    hitPoints: number;
    sphere: Sphere;
    type: CardType;
    engagement: number;
    threat: number;
    sequence: number;
    questPoints: number;
  }>;

export type HeroProps = {
  name: string;
  threatCost: number;
  willpower: number;
  attack: number;
  defense: number;
  hitPoints: number;
  traits?: Trait[];
  sphere: Sphere;
};

export type AllyProps = {
  name: string;
  unique: boolean;
  cost: number;
  willpower: number;
  attack: number;
  defense: number;
  hitPoints: number;
  traits: Trait[];
  sphere: Sphere;
};

export type EventProps = {
  name: string;
  cost: number;
  sphere: Sphere;
};

export type AttachmentProps = {
  name: string;
  unique: boolean;
  cost: number;
  traits: Trait[];
  sphere: Sphere;
};

export type LocationProps = {
  name: string;
  threat: number;
  questPoints: number;
  traits: Trait[];
  victory?: number;
};

export type EnemyProps = {
  name: string;
  engagement: number;
  threat: number;
  attack: number;
  defense: number;
  hitPoints: number;
  traits: Trait[];
  victory?: number;
};

export type QuestProps = {
  name: string;
  sequence: number;
  questPoints: number;
};

export type TreacheryProps = {
  name: string;
};

export type Trait =
  | "dwarf"
  | "noble"
  | "warrior"
  | "gondor"
  | "title"
  | "noldor"
  | "rohan"
  | "dúnedain"
  | "ranger"
  | "creature"
  | "spider"
  | "forest"
  | "dolGuldur"
  | "orc"
  | "goblin"
  | "mountain"
  | "stronghold"
  | "insect"
  | "silvan"
  | "beorning"
  | "archer"
  | "artifact"
  | "weapon"
  | "item"
  | "armor"
  | "istari";

export type Sphere = "tactics" | "spirit" | "lore" | "leadership" | "neutral";

export type Keywords = {
  ranged: boolean;
  sentinel: boolean;
};

export type CardDefinition = {
  face: PrintedProps;
  back: PrintedProps;
  orientation: "landscape" | "portrait";
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
  | "inPlay"
  | "isCharacter"
  | "isHero"
  | "isAlly"
  | { type: "and"; a: CardPredicate; b: CardPredicate };

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
  | { type: "IsLess"; a: NumberValue; b: NumberValue }
  | { type: "IsMore"; a: NumberValue; b: NumberValue }
  | { type: "And"; a: BoolValue; b: BoolValue }
  | { type: "Or"; a: BoolValue; b: BoolValue }
  | { type: "Not"; value: BoolValue }
  | { type: "CardBoolValue"; card: CardId; predicate: CardPredicate };

export type NumberValue =
  | number
  | { type: "CardNumberValue"; card: CardId; property: "damage" };

export type Tokens = Record<Token, number>;

export type Marks = Record<Mark, boolean>;
