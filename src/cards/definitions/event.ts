import { EventProps, Ability, emptyKeywords } from "../../engine/types";
import { CardDefinition } from "../../engine/state";
import playerBack from "../../Images/back/card.jpg";

export function event(props: EventProps, ...abilities: Ability[]): CardDefinition {
  const image = `https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Core-Set/${props.name
    .split(" ")
    .join("-")}.jpg`;
  return {
    face: {
      ...props,
      image,
      type: "event",
      keywords: emptyKeywords,
      abilities,
      traits: [],
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
