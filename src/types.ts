import { Ability } from "./cards/sets/core/quests";
import { PlayerId } from "./engine";

export type Phase =
  | "setup"
  | "resource"
  | "planning"
  | "quest"
  | "travel"
  | "encounter"
  | "combat"
  | "refresh";

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

export type AbilityView = Ability & { applied: boolean };

export type CommonProps = {
  image: string;
  traits: Trait[];
  keywords: Keywords;
  abilities?: Ability[];
};

export const playerIds: PlayerId[] = ["A", "B", "C", "D"];

export type Keyword = keyof Keywords;

export const emptyKeywords: Keywords = { ranged: false, sentinel: false };

export type Keywords = {
  ranged: boolean;
  sentinel: boolean;
};

export type HeroProps = {
  name: string;
  threatCost: number;
  willpower: number;
  attack: number;
  defense: number;
  hitPoints: number;
  traits: Trait[];
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
