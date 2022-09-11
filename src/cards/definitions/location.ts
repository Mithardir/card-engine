import encounterBack from "../../images/back/encounter.jpg";
import { CardDefinition } from "../../engine";
import { LocationProps, emptyKeywords } from "../../types";

export function location(props: LocationProps): CardDefinition {
  const image = `https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Core-Set/${props.name
    .split(" ")
    .join("-")}.jpg`;

  return {
    face: {
      ...props,
      image,
      type: "location",
      keywords: emptyKeywords,
    },
    back: {
      image: encounterBack,      
      traits: [],
      keywords: emptyKeywords,
    },
    orientation: "portrait",
  };
}
