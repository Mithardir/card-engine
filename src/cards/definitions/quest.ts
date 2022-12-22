import { CardDefinition } from "../../types/state";
import { emptyKeywords } from "../../types/basic";
import { Ability } from "../abilities/Ability";

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
      keywords: emptyKeywords,
      traits: [],
      abilities,
    },
    back: {
      name: nameB,
      image: back,
      sequence: def.sequence,
      type: "quest",
      questPoints: def.b.questPoints,
      traits: [],
      keywords: emptyKeywords,
    },
    orientation: "landscape",
  };
}
