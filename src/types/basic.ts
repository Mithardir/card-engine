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

export type Keywords = {
  ranged: boolean;
  sentinel: boolean;
};

export type Keyword = keyof Keywords;

// todo remove
export const emptyKeywords: Keywords = { ranged: false, sentinel: false };

export type Side = "face" | "back";

export type Token = "damage" | "progress" | "resources";

export type Mark = "questing" | "attacking" | "defending" | "attacked";

export type Tokens = Record<Token, number>;

export type Marks = Record<Mark, boolean>;
