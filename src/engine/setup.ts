import {
  beorn,
  gondorianSpearman,
  horsebackArcher,
  veteranAxehand,
  gandalf,
} from "../cards/sets/core/allies";
import {
  bladeOfGondolin,
  citadelPlate,
  dwarvenAxe,
  hornOfGondor,
} from "../cards/sets/core/attachments";
import {
  kingSpider,
  hummerhorns,
  ungoliantsSpawn,
  dolGuldurOrcs,
  chieftanUfthak,
  dolGuldurBeastmaster,
  forestSpider,
  eastBightPatrol,
  blackForestBats,
} from "../cards/sets/core/enemies";
import {
  bladeMastery,
  feint,
  quickStrike,
  rainOfArrows,
  standTogether,
  swiftStrike,
  thicketOfSpears,
} from "../cards/sets/core/events";
import { legolas, thalin, gimli } from "../cards/sets/core/heroes";
import {
  greatForestWeb,
  mountainsOfMirkwood,
  necromancersPass,
  enchantedStream,
  oldForestRoad,
  forestGate,
} from "../cards/sets/core/locations";
import {
  achosenPath1,
  achosenPath2,
  aForkInTheRoad,
  fliesAndSpiders,
} from "../cards/sets/core/quests";
import {
  eyesOfTheForest,
  caughtInAWeb,
  drivenByShadow,
  theNecromancersReach,
} from "../cards/sets/core/treacheries";
import { CardDefinition } from "./state";

export interface Scenario {
  name: string;
  questCards: CardDefinition[];
  encounterCards: CardDefinition[];
}

export type PlayerDeck = {
  name: string;
  heroes: CardDefinition[];
  library: CardDefinition[];
};

export function playerDeck(name: string) {
  const deck: PlayerDeck = { name, heroes: [], library: [] };
  const x = {
    addHero(card: CardDefinition) {
      deck.heroes.push(card);
      return x;
    },
    addCard(card: CardDefinition) {
      deck.library.push(card);
      return x;
    },
    build() {
      return deck;
    },
  };
  return x;
}

export const coreTactics: PlayerDeck = {
  name: "Core (Tactics)",
  heroes: [legolas, thalin, gimli],
  library: [
    beorn,
    gondorianSpearman,
    gondorianSpearman,
    gondorianSpearman,
    horsebackArcher,
    horsebackArcher,
    veteranAxehand,
    veteranAxehand,
    veteranAxehand,
    bladeOfGondolin,
    bladeOfGondolin,
    citadelPlate,
    citadelPlate,
    dwarvenAxe,
    dwarvenAxe,
    hornOfGondor,
    bladeMastery,
    bladeMastery,
    bladeMastery,
    feint,
    feint,
    quickStrike,
    quickStrike,
    rainOfArrows,
    rainOfArrows,
    standTogether,
    swiftStrike,
    thicketOfSpears,
    thicketOfSpears,
    gandalf,
    gandalf,
    gandalf,
  ],
};

export const passageThroughMirkwood: Scenario = {
  name: "Passage Through Mirkwood",
  questCards: [fliesAndSpiders, aForkInTheRoad, achosenPath1, achosenPath2],
  encounterCards: [
    kingSpider,
    kingSpider,
    hummerhorns,
    ungoliantsSpawn,
    greatForestWeb,
    greatForestWeb,
    mountainsOfMirkwood,
    mountainsOfMirkwood,
    mountainsOfMirkwood,
    eyesOfTheForest,
    caughtInAWeb,
    caughtInAWeb,
    dolGuldurOrcs,
    dolGuldurOrcs,
    dolGuldurOrcs,
    chieftanUfthak,
    dolGuldurBeastmaster,
    dolGuldurBeastmaster,
    drivenByShadow,
    theNecromancersReach,
    theNecromancersReach,
    theNecromancersReach,
    necromancersPass,
    necromancersPass,
    enchantedStream,
    enchantedStream,
    forestSpider,
    forestSpider,
    forestSpider,
    forestSpider,
    eastBightPatrol,
    blackForestBats,
    oldForestRoad,
    oldForestRoad,
    forestGate,
    forestGate,
  ],
};
