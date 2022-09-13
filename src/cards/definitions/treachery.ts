import encounterBack from "../../images/back/encounter.jpg";
import { CardDefinition } from "../../types/state";
import { emptyKeywords } from "../../types/basic";
import { TreacheryProps } from "../../types/cards";

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
