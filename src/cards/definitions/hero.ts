import { HeroProps, Ability, emptyKeywords } from "../../engine/types";
import { CardDefinition } from "../../engine/state";
import playerBack from "../../Images/back/card.jpg";

export function hero(props: HeroProps, ...abilities: Ability[]): CardDefinition {
  const image = `https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Core-Set/${props.name
    .split(" ")
    .join("-")}.jpg`;

  return {
    face: {
      ...props,
      image,
      type: "hero",
      unique: true,
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
