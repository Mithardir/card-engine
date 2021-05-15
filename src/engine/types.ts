import { CardId, GameZoneType, PlayerId, PlayerZoneType } from "./state";
import { View } from "./view";

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

export type Keyword = keyof Keywords;

export const emptyKeywords: Keywords = { ranged: false, sentinel: false };

export type Keywords = {
  ranged: boolean;
  sentinel: boolean;
};

export type Ability = {
  description: string;
  implicit: boolean;
  activate: (view: View, self: CardId) => void;
};

export type CommonProps = {
  image: string;
  traits: Trait[];
  keywords: Keywords;
  abilities: Ability[];
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
    type: "hero" | "ally" | "quest" | "attachment" | "enemy" | "event" | "treachery" | "location" | "quest";
    engagement: number;
    threat: number;
    sequence: number;
    questPoints: number;
  }>;

export type Token = "damage" | "resources" | "progress";

export type ZoneKey =
  | { type: GameZoneType; player?: never; print: string }
  | { type: PlayerZoneType; player: PlayerId; print: string };
