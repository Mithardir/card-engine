import playerBack from "../../images/back/card.jpg";
import { CardDefinition } from "../../engine";
import { HeroProps, emptyKeywords } from "../../types";

export function hero(props: HeroProps): CardDefinition {
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
    },
    back: {
      image: playerBack,
      traits: [],
      keywords: emptyKeywords,
    },
    orientation: "portrait",
  };
}
