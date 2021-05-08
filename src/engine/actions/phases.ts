import { canTravel, countOfPlayers, diff, enemiesToEngage, isHero, isLocation, isTapped, lit, totalThread, totalWillpower } from "../filters";
import { Scenario, PlayerDeck } from "../setup";
import { createCardState, playerIds } from "../state";
import { zoneKey } from "../utils";
import { generateResource, untap } from "./card";
import { repeat, chooseCardForAction, action, bind, sequence, whileDo } from "./control";
import { eachCard, moveTopCard, placeProgress, travelToLocation, passFirstPlayerToken, addPlayer, shuffleZone, dealShadowCards, eachPlayer, playerActions } from "./game";
import { draw, commitCharactersToQuest, incrementThreat, optionalEngagement, engagementCheck, resolveEnemyAttacks, resolvePlayerAttacks } from "./player";
import { Action } from "./types";

export const phaseResource = sequence(
  eachPlayer(draw(1)),
  eachCard(isHero, generateResource(1)),
  playerActions("End resource phase")
);

export const phasePlanning = playerActions("End planning phase");

export const phaseQuest = sequence(
  eachPlayer(commitCharactersToQuest),
  playerActions("Staging"),
  bind(countOfPlayers, (count) => repeat(count, moveTopCard(zoneKey("encounterDeck"), zoneKey("stagingArea"), "face"))),
  playerActions("Quest resolution"),
  bind(diff(totalWillpower, totalThread), (power) =>
    power > 0 ? placeProgress(power) : eachPlayer(incrementThreat(-power))
  ),
  playerActions("End phase")
);

export const phaseTravel = sequence(
  // TODO allow no travel
  bind(canTravel, (can) =>
    can ? chooseCardForAction("Choose location for travel", isLocation, travelToLocation()) : sequence()
  ),
  playerActions("End travel phase")
);

export const phaseEncounter = sequence(
  eachPlayer(optionalEngagement),
  playerActions("Engagement Checks"),
  whileDo(enemiesToEngage, eachPlayer(engagementCheck)),
  playerActions("Next encounter phase")
);

export const phaseCombat = sequence(
  dealShadowCards,
  playerActions("Resolve enemy attacks"),
  eachPlayer(resolveEnemyAttacks),
  playerActions("Resolve player attacks"),
  eachPlayer(resolvePlayerAttacks),
  playerActions("End combat phase")
);

export const phaseRefresh = sequence(
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
    const quest = scenario.questCards.map((q, index) => createCardState(index * 5 + 5, q, "back"));
    const cards = scenario.encounterCards.map((e, index) => createCardState((index + quest.length) * 5 + 5, e, "back"));

    s.zones.encounterDeck.cards.push(...cards.map((c) => c.id));
    s.zones.questDeck.cards.push(...quest.map((c) => c.id));

    s.cards.push(...quest, ...cards);
    return "full";
  });
}

export function beginScenario(scenario: Scenario, ...decks: PlayerDeck[]): Action {
  return sequence(
    setupScenario(scenario),
    ...decks.map((d, i) => addPlayer(playerIds[i], d)),
    shuffleZone(zoneKey("encounterDeck")),
    eachPlayer((p) => shuffleZone(zoneKey("library", p))),
    eachPlayer(draw(6)),
    moveTopCard(zoneKey("questDeck"), zoneKey("quest"), "face"),
    startGame
  );
}
