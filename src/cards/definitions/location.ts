import { LocationProps, Ability, emptyKeywords } from "../../engine/cardprops";
import { CardDefinition } from "../../engine/state";
import playerBack from "../../Images/back/card.jpg";

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
      image: playerBack,
      abilities: [],
      traits: [],
      keywords: emptyKeywords,
    },
    orientation: "portrait",
  };
}
