import encounterBack from "../../images/back/encounter.jpg";
import { CardDefinition } from "../../engine";
import { TreacheryProps, emptyKeywords } from "../../types";

export function treachery(props: TreacheryProps): CardDefinition {
  const image = `https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Core-Set/${props.name
    .split(" ")
    .join("-")}.jpg`;

  return {
    face: {
      ...props,
      image,
      type: "treachery",
      keywords: emptyKeywords,
      traits: [],
    },
    back: {
      image: encounterBack,
      traits: [],
      keywords: emptyKeywords,
    },
    orientation: "portrait",
  };
}
