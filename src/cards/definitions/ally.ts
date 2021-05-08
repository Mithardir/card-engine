import { AllyProps, Ability, emptyKeywords } from "../../engine/types";
import { CardDefinition } from "../../engine/state";
import playerBack from "../../Images/back/card.jpg";

export function ally(props: AllyProps, ...abilities: Ability[]): CardDefinition {
  const image = `https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Core-Set/${props.name
    .split(" ")
    .join("-")}.jpg`;
  return {
    face: {
      ...props,
      image,
      type: "ally",
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
