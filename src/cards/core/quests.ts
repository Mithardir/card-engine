import { setup } from "../../factories/abilities";
import {
  addToStagingArea,
  sequence,
  shuffleZone,
} from "../../factories/actions";
import { quest } from "../../factories/cards";

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
      shuffleZone("encounterDeck")
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
