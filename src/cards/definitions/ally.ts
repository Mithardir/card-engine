import playerBack from "../../images/back/card.jpg";
import { emptyKeywords } from "../../types/basic";
import { AllyProps } from "../../types/cards";
import { CardDefinition } from "../../types/state";

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
