import { moveCard } from "../../../engine/actions/card";
import { sequence } from "../../../engine/actions/control";
import { shuffleZone } from "../../../engine/actions/game";
import { Action } from "../../../engine/actions/types";
import { zoneKey } from "../../../engine/utils";
import { quest, setup } from "../../definitions/quest";

function addToStagingArea(name: string): Action {
  return {
    print: `addToStagingArea(${name})`,
    do: (s) => {
      const card = s.cards.find((c) => c.definition.face.name === name);
      if (card) {
        return moveCard(
          zoneKey("encounterDeck"),
          zoneKey("stagingArea"),
          "face"
        )(card.id).do(s);
      }
      return sequence().do(s);
    },
  };
}

export const fliesAndSpiders = quest(
  {
    sequence: 1,
    name: "Flies and Spiders",
    a: {},
    b: {
      questPoints: 8,
    },
  },
  setup({
    description:
      "Setup: Search the encounter deck for 1 copy of the Forest Spider and 1 copy of the Old Forest Road, and add them to the staging area. Then, shuffle the encounter deck.",
    action: sequence(
      addToStagingArea("Forest Spider"),
      addToStagingArea("Old Forest Road"),
      shuffleZone(zoneKey("encounterDeck"))
    ),
  })
);

export const aForkInTheRoad = quest({
  sequence: 2,
  name: "A Fork in the Road",
  a: {},
  b: {
    questPoints: 2,
  },
});

export const achosenPath1 = quest({
  sequence: 3,
  a: {
    name: "A Chosen Path",
    image:
      "https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Core-Set/A-Chosen-Path-Don't-Leave-the-Path-3A.jpg",
  },
  b: {
    name: "Don't Leave the Path",
    image:
      "https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Core-Set/A-Chosen-Path-Don't-Leave-the-Path-3B.jpg",
    questPoints: 0,
  },
});

export const achosenPath2 = quest({
  sequence: 3,
  a: {
    name: "A Chosen Path",
    image:
      "https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Core-Set/A-Chosen-Path-Beorn's-Path-3A.jpg",
  },
  b: {
    name: "Beorn's Path",
    image:
      "https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Core-Set/A-Chosen-Path-Beorn's-Path-3B.jpg",
    questPoints: 10,
  },
});
