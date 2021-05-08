import { LocationProps, Ability, emptyKeywords } from "../../engine/types";
import { CardDefinition } from "../../engine/state";
import encounterBack from "../../Images/back/encounter.jpg";

export function location(props: LocationProps, ...abilities: Ability[]): CardDefinition {
  const image = `https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Core-Set/${props.name
    .split(" ")
    .join("-")}.jpg`;
  return {
    face: {
      ...props,
      image,
      type: "location",
      keywords: emptyKeywords,
      abilities,
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
