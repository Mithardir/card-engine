import { EnemyProps, Ability, emptyKeywords } from "../../engine/cardprops";
import { CardDefinition } from "../../engine/state";
import encounterBack from "../../Images/back/encounter.jpg";

export function enemy(props: EnemyProps, ...abilities: Ability[]): CardDefinition {
  const image =
    props.name !== "Dol Guldur Orcs"
      ? `https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Core-Set/${props.name.split(" ").join("-")}.jpg`
      : "https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Core-Set/Dol-Guldur-Orcs-Enemy.jpg";

  return {
    face: {
      ...props,
      image,
      type: "enemy",
      keywords: emptyKeywords,
      abilities,
    },
    back: {
      image: encounterBack,
      abilities: [],
      traits: [],
      keywords: emptyKeywords,
    },
    orientation: "portrait",
  };
}
