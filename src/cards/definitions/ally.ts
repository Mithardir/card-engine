import playerBack from "../../images/back/card.jpg";
import { CardDefinition } from "../../engine";
import { AllyProps, emptyKeywords } from "../../types";

export function ally(props: AllyProps): CardDefinition {
  const image = `https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Core-Set/${props.name
    .split(" ")
    .join("-")}.jpg`;

  return {
    face: {
      ...props,
      image,
      type: "ally",
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
