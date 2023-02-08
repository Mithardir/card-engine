import { Ability } from "../types/basic";
import {
  AllyProps,
  AttachmentProps,
  CardDefinition,
  EnemyProps,
  EventProps,
  HeroProps,
  LocationProps,
  TreacheryProps,
} from "../types/cards";
import playerBack from "../images/back/card.jpg";
import encounterBack from "../images/back/encounter.jpg";

export function ally(props: AllyProps): CardDefinition {
  const image = `https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Core-Set/${props.name
    .split(" ")
    .join("-")}.jpg`;

  return {
    face: {
      ...props,
      image,
      type: "ally",
    },
    back: {
      image: playerBack,
    },
    orientation: "portrait",
  };
}

export function attachment(props: AttachmentProps): CardDefinition {
  const image = `https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Core-Set/${props.name
    .split(" ")
    .join("-")}.jpg`;

  return {
    face: {
      ...props,
      image,
      type: "attachment",
    },
    back: {
      image: playerBack,
    },
    orientation: "portrait",
  };
}

export function enemy(props: EnemyProps): CardDefinition {
  const image =
    props.name !== "Dol Guldur Orcs"
      ? `https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Core-Set/${props.name
          .split(" ")
          .join("-")}.jpg`
      : "https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Core-Set/Dol-Guldur-Orcs-Enemy.jpg";

  return {
    face: {
      ...props,
      image,
      type: "enemy",
    },
    back: {
      image: encounterBack,
    },
    orientation: "portrait",
  };
}

export function event(
  props: EventProps,
  ...abilities: Ability[]
): CardDefinition {
  const image = `https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Core-Set/${props.name
    .split(" ")
    .join("-")}.jpg`;

  return {
    face: {
      ...props,
      image,
      type: "event",

      abilities,
    },
    back: {
      image: playerBack,
    },
    orientation: "portrait",
  };
}

export function hero(
  props: HeroProps,
  ...abilities: Ability[]
): CardDefinition {
  const image = `https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Core-Set/${props.name
    .split(" ")
    .join("-")}.jpg`;

  return {
    face: {
      ...props,
      image,
      type: "hero",
      unique: true,
      abilities,
    },
    back: {
      image: playerBack,
    },
    orientation: "portrait",
  };
}

export function location(props: LocationProps): CardDefinition {
  const image = `https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Core-Set/${props.name
    .split(" ")
    .join("-")}.jpg`;

  return {
    face: {
      ...props,
      image,
      type: "location",
    },
    back: {
      image: encounterBack,
    },
    orientation: "portrait",
  };
}

export type QuestDefinition =
  | {
      sequence: number;
      name?: never;
      a: { name: string; image?: string };
      b: { name: string; image?: string; questPoints: number };
    }
  | {
      sequence: number;
      name: string;
      a: { name?: never; image?: string };
      b: { name?: never; image?: string; questPoints: number };
    };

export function quest(
  def: QuestDefinition,
  ...abilities: Ability[]
): CardDefinition {
  const nameA = def.name ?? def.a.name;
  const nameB = def.name ?? def.b.name;

  const front =
    def.a.image ??
    `https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Core-Set/${nameA
      .split(" ")
      .join("-")}-${def.sequence}A.jpg`;

  const back =
    def.b.image ??
    `https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Core-Set/${nameB
      .split(" ")
      .join("-")}-${def.sequence}B.jpg`;

  return {
    face: {
      name: nameA,
      image: front,
      sequence: def.sequence,
      type: "quest",
      abilities,
    },
    back: {
      name: nameB,
      image: back,
      sequence: def.sequence,
      type: "quest",
      questPoints: def.b.questPoints,
    },
    orientation: "landscape",
  };
}

export function treachery(props: TreacheryProps): CardDefinition {
  const image = `https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Core-Set/${props.name
    .split(" ")
    .join("-")}.jpg`;

  return {
    face: {
      ...props,
      image,
      type: "treachery",
    },
    back: {
      image: encounterBack,
    },
    orientation: "portrait",
  };
}
