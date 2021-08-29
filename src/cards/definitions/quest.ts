import { Ability, emptyKeywords } from "../../engine/types";
import { CardDefinition } from "../../engine/state";
import { Action } from "../../engine/actions/types";
import { modifyCard, setSetup } from "../../engine/actions/modifiers";

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

export function setup(props: { description: string; action: Action }): Ability {
  return {
    description: props.description,
    implicit: false,
    activate: (view, self) => modifyCard(self, setSetup(props.action)),
  };
}

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
      keywords: emptyKeywords,
      abilities,
      traits: [],
    },
    back: {
      name: nameB,
      image: back,
      sequence: def.sequence,
      type: "quest",
      questPoints: def.b.questPoints,
      abilities: [],
      traits: [],
      keywords: emptyKeywords,
    },
    orientation: "landscape",
  };
}
