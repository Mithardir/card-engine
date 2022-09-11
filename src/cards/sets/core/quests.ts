import {
  Action,
  addToStagingArea,
  CardId,
  CardView,
  gameZone,
  sequence,
  shuffleZone,
  View,
} from "../../../engine";
import { quest } from "../../definitions/quest";

export type ViewModifier = { print: string; modify: (view: View) => void };

export type CardModifier = {
  print: string;
  modify: (card: CardView, view: View) => void;
};

export function modifyCard(id: CardId, modifier: CardModifier): ViewModifier {
  return {
    print: `modifyCard(${id}, ${modifier.print})`,
    modify: (v) => {
      const card = v.cards[id];
      if (card) {
        modifier.modify(card, v);
      }
    },
  };
}

export function addSetup(action: Action): CardModifier {
  return {
    print: `addSetup(${action.print})`,
    modify: (c) => c.setup.push(action),
  };
}

export type Ability = {
  description: string;
  implicit: boolean;
  modifier: (self: CardId) => ViewModifier;
};

export function setup(props: { description: string; action: Action }): Ability {
  return {
    description: props.description,
    implicit: false,
    modifier: (self) => modifyCard(self, addSetup(props.action)),
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
      shuffleZone(gameZone("encounterDeck"))
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
      "https://s3.amazonaws.com/hallofbeorn-resources/images/Cards/Core-Set/A-Chosen-Path-Don't-Leave-the-Path-3A.jpg",
  },
  b: {
    name: "Don't Leave the Path",
    image:
      "https://s3.amazonaws.com/hallofbeorn-resources/images/Cards/Core-Set/A-Chosen-Path-Don't-Leave-the-Path-3B.jpg",
    questPoints: 0,
  },
});

export const achosenPath2 = quest({
  sequence: 3,
  a: {
    name: "A Chosen Path",
    image:
      "https://s3.amazonaws.com/hallofbeorn-resources/images/Cards/Core-Set/A-Chosen-Path-Beorn's-Path-3A.jpg",
  },
  b: {
    name: "Beorn's Path",
    image:
      "https://s3.amazonaws.com/hallofbeorn-resources/images/Cards/Core-Set/A-Chosen-Path-Beorn's-Path-3B.jpg",
    questPoints: 10,
  },
});
