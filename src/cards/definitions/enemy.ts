import encounterBack from "../../images/back/encounter.jpg";
import { CardDefinition } from "../../types/state";
import { emptyKeywords } from "../../types/basic";
import { EnemyProps } from "../../types/cards";

export function enemy(props: EnemyProps): CardDefinition {
  const image =
    props.name !== "Dol Guldur Orcs"
      ? `https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Core-Set/${props.name
          .split(" ")
          .join("-")}.jpg`
      : "https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Core-Set/Dol-Guldur-Orcs-Enemy.jpg";

  return {
    face: {
      ...props,
      image,
      type: "enemy",
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
