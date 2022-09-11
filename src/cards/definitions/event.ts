import playerBack from "../../images/back/card.jpg";
import { CardDefinition } from "../../engine";
import { EventProps, emptyKeywords } from "../../types";

export function event(props: EventProps): CardDefinition {
  const image = `https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Core-Set/${props.name
    .split(" ")
    .join("-")}.jpg`;

  return {
    face: {
      ...props,
      image,
      type: "event",
      keywords: emptyKeywords,
      traits: [],
    },
    back: {
      image: playerBack,
      traits: [],
      keywords: emptyKeywords,
    },
    orientation: "portrait",
  };
}
