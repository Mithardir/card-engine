import { QuestProps, Ability, emptyKeywords } from "../../engine/types";
import { CardDefinition } from "../../engine/state";

export function quest(props: QuestProps, ...abilities: Ability[]): CardDefinition {
  const front = `https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Core-Set/${props.name
    .split(" ")
    .join("-")}-${props.sequence}A.jpg`;

  const back = `https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Core-Set/${props.name
    .split(" ")
    .join("-")}-${props.sequence}B.jpg`;

  return {
    face: {
      ...props,
      image: front,
      type: "quest",
      keywords: emptyKeywords,
      abilities,
      traits: [],
    },
    back: {
      image: back,
      abilities: [],
      traits: [],
      keywords: emptyKeywords,
    },
    orientation: "landscape",
  };
}
