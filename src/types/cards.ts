import { Ability, CardType } from "./basic";

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
