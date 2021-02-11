import { TreacheryProps, Ability, emptyKeywords } from "../../engine/cardprops";
import { CardDefinition } from "../../engine/state";
import encounterBack from "../../Images/back/encounter.jpg";

export function treachery(props: TreacheryProps, ...abilities: Ability[]): CardDefinition {
  const image = `https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Core-Set/${props.name
    .split(" ")
    .join("-")}.jpg`;
  return {
    face: {
      ...props,
      image,
      type: "treachery",
      keywords: emptyKeywords,
      abilities,
      traits: [],
    },
    back: {
      image: encounterBack,
      abilities: [],
      traits: [],
      keywords: emptyKeywords,
    },
    orientation: "portrait",
  };
}
