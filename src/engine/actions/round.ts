import { Scenario, PlayerDeck } from "../setup";
import { PlayerId, playerIds } from "../../types/state";
import { Action } from "../types";
import { reverse } from "lodash";
import { and, isHero, isInPlay, isTapped } from "../filters";
import {
  countOfPlayers,
  canTravel,
  enemiesToEngage,
  value,
  gameZone,
  topCard,
} from "../getters";
import { generateResource } from "./card";
import {
  beginPhase,
  eachCard,
  playerActions,
  revealEncounterCard,
  resolveQuest,
  clearMarks,
  ifThenElse,
  chooseTravelLocation,
  whileDo,
  eachPlayer,
  flipCard,
  sequence,
  setupActions,
  shuffleZone,
  repeat,
  endPhase,
  endRound,
} from "./global";
import {
  commitCharactersToQuest,
  optionalEngagement,
  engagementCheck,
  resolveEnemyAttacks,
  resolvePlayerAttacks,
  incrementThreat,
  draw,
  shuffleLibrary,
} from "./player";
import { createCardState } from "../engine";
import { flip, untap } from "./basic";

export const phaseResource = sequence(
  beginPhase("resource"),
  eachPlayer(draw(1)),
  eachCard(and(isHero, isInPlay), generateResource(value(1))),
  playerActions("End resource phase"),
  endPhase()
);

export const phasePlanning = sequence(
  beginPhase("planning"),
  playerActions("End planning phase"),
  endPhase()
);

export const phaseQuest = sequence(
  beginPhase("quest"),
  eachPlayer(commitCharactersToQuest()),
  playerActions("Staging"),
  repeat(countOfPlayers, revealEncounterCard),
  playerActions("Quest resolution"),
  resolveQuest(),
  playerActions("End phase"),
  clearMarks("questing"),
  endPhase()
);

export const phaseTravel = sequence(
  beginPhase("travel"),
  ifThenElse(canTravel, chooseTravelLocation, sequence()),
  playerActions("End travel phase"),
  endPhase()
);

export const phaseEncounter = sequence(
  beginPhase("encounter"),
  eachPlayer(optionalEngagement()),
  playerActions("Engagement Checks"),
  whileDo(enemiesToEngage, eachPlayer(engagementCheck())),
  playerActions("Next encounter phase"),
  endPhase()
);

export const phaseCombat = sequence(
  beginPhase("combat"),
  // dealShadowCards,
  playerActions("Resolve enemy attacks"),
  eachPlayer(resolveEnemyAttacks()),
  clearMarks("attacked"),
  playerActions("Resolve player attacks"),
  eachPlayer(resolvePlayerAttacks()),
  clearMarks("attacked"),
  playerActions("End combat phase"),
  endPhase()
);

export const phaseRefresh = sequence(
  beginPhase("refresh"),
  eachCard(isTapped, untap()),
  eachPlayer(incrementThreat(value(1))),
  // passFirstPlayerToken,
  playerActions("End refresh phase and round"),
  endPhase()
);

export const gameRound = sequence(
  phaseResource,
  phasePlanning,
  phaseQuest,
  phaseTravel,
  phaseEncounter,
  phaseCombat,
  phaseRefresh,
  endRound()
);

export const startGame = whileDo(value(true), gameRound);

export function beginScenario(
  scenario: Scenario,
  ...decks: PlayerDeck[]
): Action {
  return sequence(
    setupScenario(scenario),
    ...decks.map((d, i) => addPlayer(playerIds[i], d)),
    shuffleZone(gameZone("encounterDeck")),
    eachPlayer(shuffleLibrary()),
    eachPlayer(draw(6)),
    flip("face").card(topCard(gameZone("questDeck"))),
    setupActions,
    flip("back").card(topCard(gameZone("questDeck"))),
    startGame
  );
}

export function addPlayer(playerId: PlayerId, deck: PlayerDeck): Action {
  return {
    print: `addPlayer(${playerId}, "${deck.name}")`,
    apply: (s) => {
      const playerIndex = playerIds.findIndex((p) => p === playerId);

      const heroes = deck.heroes.map((h, index) =>
        createCardState(index * 5 + playerIndex + 1, h, "face", playerId)
      );

      const library = deck.library.map((l, index) =>
        createCardState(
          (index + heroes.length) * 5 + playerIndex + 1,
          l,
          "back",
          playerId
        )
      );

      s.players[playerId] = {
        id: playerId,
        thread: heroes
          .map((h) => h.definition.face.threatCost!)
          .reduce((p, c) => p + c, 0),
        zones: {
          hand: { cards: [], stack: false },
          library: { cards: library.map((l) => l.id), stack: true },
          playerArea: { cards: heroes.map((h) => h.id), stack: false },
          discardPile: { cards: [], stack: true },
          engaged: { cards: [], stack: false },
        },
      };

      s.cards = [...heroes, ...library].reduce(
        (p, c) => ({ ...p, [c.id]: c }),
        s.cards
      );
    },
  };
}

export function setupScenario(scenario: Scenario): Action {
  return {
    print: `setupScenario("${scenario.name}")`,
    apply: (s) => {
      const quest = scenario.questCards.map((q, index) =>
        createCardState(index * 5 + 5, q, "back", undefined)
      );

      const cards = scenario.encounterCards.map((e, index) =>
        createCardState((index + quest.length) * 5 + 5, e, "back", undefined)
      );

      s.zones.encounterDeck.cards.push(...cards.map((c) => c.id));
      s.zones.questDeck.cards.push(...reverse(quest.map((c) => c.id)));

      s.cards = [...quest, ...cards].reduce(
        (p, c) => ({ ...p, [c.id]: c }),
        s.cards
      );
    },
  };
}
