import { reverse } from "lodash";
import {
  countOfPlayers,
  diff,
  totalWillpower,
  totalThread,
  canTravel,
  enemiesToEngage,
  lit,
} from "../exps";
import { isHero, isTapped } from "../filters";
import { Scenario, PlayerDeck } from "../setup";
import { createCardState, playerIds } from "../state";
import { zoneKey } from "../utils";
import { generateResource, setSide, untap } from "./card";
import { sequence, repeat, whileDo, action, bind, ifThen } from "./control";
import {
  eachCard,
  moveTopCard,
  placeProgress,
  passFirstPlayerToken,
  addPlayer,
  shuffleZone,
  dealShadowCards,
  eachPlayer,
  playerActions,
  clearMarks,
  chooseTravelLocation,
  beginPhase,
} from "./game";
import {
  draw,
  commitCharactersToQuest,
  incrementThreat,
  optionalEngagement,
  engagementCheck,
  resolveEnemyAttacks,
  resolvePlayerAttacks,
} from "./player";
import { Action } from "./types";

export const phaseResource = sequence(
  beginPhase("resource"),
  eachPlayer(draw(1)),
  eachCard(isHero, generateResource(1)),
  playerActions("End resource phase")
);

export const phasePlanning = sequence(
  beginPhase("planning"),
  playerActions("End planning phase")
);

export const phaseQuest = sequence(
  beginPhase("quest"),
  eachPlayer(commitCharactersToQuest),
  playerActions("Staging"),
  bind(countOfPlayers, (count) =>
    repeat(
      count,
      moveTopCard(zoneKey("encounterDeck"), zoneKey("stagingArea"), "face")
    )
  ),
  playerActions("Quest resolution"),
  bind(diff(totalWillpower, totalThread), (power) =>
    power > 0 ? placeProgress(power) : eachPlayer(incrementThreat(-power))
  ),
  playerActions("End phase"),
  clearMarks("questing")
);

export const phaseTravel = sequence(
  beginPhase("travel"),
  ifThen(canTravel, chooseTravelLocation),
  playerActions("End travel phase")
);

export const phaseEncounter = sequence(
  beginPhase("encounter"),
  eachPlayer(optionalEngagement),
  playerActions("Engagement Checks"),
  whileDo(enemiesToEngage, eachPlayer(engagementCheck)),
  playerActions("Next encounter phase")
);

export const phaseCombat = sequence(
  beginPhase("combat"),
  dealShadowCards,
  playerActions("Resolve enemy attacks"),
  eachPlayer(resolveEnemyAttacks),
  playerActions("Resolve player attacks"),
  eachPlayer(resolvePlayerAttacks),
  clearMarks("attacked"),
  playerActions("End combat phase")
);

export const phaseRefresh = sequence(
  beginPhase("refresh"),
  eachCard(isTapped, untap),
  eachPlayer(incrementThreat(1)),
  passFirstPlayerToken,
  playerActions("End refresh phase and round")
);

export const gameRound = sequence(
  phaseResource,
  phasePlanning,
  phaseQuest,
  phaseTravel,
  phaseEncounter,
  phaseCombat,
  phaseRefresh
);

export const startGame = whileDo(lit(true), gameRound);

export function setupScenario(scenario: Scenario): Action {
  return action(`setup scenario ${scenario.name}`, (s) => {
    const quest = scenario.questCards.map((q, index) =>
      createCardState(index * 5 + 5, q, "back")
    );
    const cards = scenario.encounterCards.map((e, index) =>
      createCardState((index + quest.length) * 5 + 5, e, "back")
    );

    s.zones.encounterDeck.cards.push(...cards.map((c) => c.id));
    s.zones.questDeck.cards.push(...reverse(quest.map((c) => c.id)));

    s.cards.push(...quest, ...cards);
  });
}

export const questSetup: Action = {
  print: `questSetup`,
  do: (s) => {
    const cardId = s.zones.quest.cards[0];
    const card = s.view.cards.find((c) => c.id === cardId);

    if (card) {
      return sequence(card.setup ?? sequence(), setSide("back")(cardId)).do(s);
    }

    return sequence().do(s);
  },
};

export function beginScenario(
  scenario: Scenario,
  ...decks: PlayerDeck[]
): Action {
  return sequence(
    setupScenario(scenario),
    ...decks.map((d, i) => addPlayer(playerIds[i], d)),
    shuffleZone(zoneKey("encounterDeck")),
    eachPlayer((p) => shuffleZone(zoneKey("library", p))),
    eachPlayer(draw(6)),
    moveTopCard(zoneKey("questDeck"), zoneKey("quest"), "face"),
    questSetup,
    startGame
  );
}
