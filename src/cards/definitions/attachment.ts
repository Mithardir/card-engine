import playerBack from "../../images/back/card.jpg";
import { CardDefinition } from "../../types/state";
import { emptyKeywords } from "../../types/basic";
import { AttachmentProps } from "../../types/cards";

export function attachment(props: AttachmentProps): CardDefinition {
  const image = `https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Core-Set/${props.name
    .split(" ")
    .join("-")}.jpg`;

  return {
    face: {
      ...props,
      image,
      type: "attachment",
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
