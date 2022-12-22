import { Action, GameAction, CardAction, PlayerAction } from "../types/actions";
import {
  Scenario,
  PlayerDeck,
  Phase,
  CardPredicate,
  PlayerPredicate,
  NumberValue,
  GameZoneType,
  Zone,
  CardFilter,
  Side,
  PlayerId,
  PlayerZoneType,
} from "../types/basic";

export function setupScenario(scenario: Scenario): Action {
  const addQuestCards: GameAction[] = scenario.questCards.map((card) => ({
    type: "AddCard",
    definition: card,
    zone: "questDeck",
    side: "back",
  }));

  const addEncounterCards: GameAction[] = scenario.encounterCards.map(
    (card) => ({
      type: "AddCard",
      definition: card,
      zone: "encounterDeck",
      side: "back",
    })
  );

  return {
    type: "Sequence",
    actions: [...addQuestCards, ...addEncounterCards],
  };
}

export function sequence(...actions: Action[]): Action {
  return {
    type: "Sequence",
    actions,
  };
}

export function addPlayer(deck: PlayerDeck): Action {
  return {
    type: "AddPlayer",
    deck,
  };
}

export function beginScenario(
  scenario: Scenario,
  ...decks: PlayerDeck[]
): Action {
  return sequence(
    setupScenario(scenario),
    ...decks.map((d) => addPlayer(d)),
    shuffleZone("encounterDeck"),
    eachPlayer(shuffleLibrary()),
    eachPlayer(draw(6)),
    flip("face", topCard(gameZone("questDeck"))),
    setupActions(),
    flip("back", topCard(gameZone("questDeck"))),
    startGame()
  );
}

export function setupActions(): Action {
  return "SetupActions";
}

export function startGame(): Action {
  return {
    type: "While",
    condition: { type: "Not", value: "GameFinished" },
    action: gameRound(),
  };
}

export function playerActions(label: string): GameAction {
  return {
    type: "PlayerActions",
    label,
  };
}

export function phaseResource(): Action {
  return sequence(
    beginPhase("resource"),
    eachPlayer(draw(1)),
    eachCard(and("isHero", "inPlay"), generateResource(1)),
    playerActions("End resource phase"),
    endPhase()
  );
}

export function beginPhase(phase: Phase): GameAction {
  return {
    type: "BeginPhase",
    phase,
  };
}

export function endPhase(): GameAction {
  return "EndPhase";
}

export function and<T extends CardPredicate | PlayerPredicate>(
  ...predicates: T[]
): { type: "and"; predicates: T[] } {
  return { type: "and", predicates };
}

export function generateResource(amount: NumberValue): CardAction {
  return {
    type: "AddResources",
    amount,
  };
}

export function gameRound(): Action {
  return sequence(
    phaseResource()
    //phasePlanning,
    //phaseQuest,
    //phaseTravel,
    //phaseEncounter,
    //phaseCombat,
    //phaseRefresh,
    //endRound()
  );
}

export function gameZone(type: GameZoneType): Zone {
  return {
    owner: "game",
    type,
  };
}

export function playerZone(player: PlayerId, type: PlayerZoneType): Zone {
  return {
    owner: player,
    type,
  };
}

export function topCard(zone: Zone): CardFilter {
  return {
    type: "TopCard",
    zone,
  };
}

export function flip(side: Side, card: CardFilter): Action {
  return {
    type: "CardAction",
    card: card,
    action: {
      type: "flip",
      side,
    },
  };
}

export function shuffleZone(zone: GameZoneType): GameAction {
  return {
    type: "ShuffleZone",
    zone,
  };
}

export function shuffleLibrary(): PlayerAction {
  return {
    type: "ShuffleZone",
    zone: "library",
  };
}

export function draw(amount: NumberValue): PlayerAction {
  return {
    type: "Draw",
    amount,
  };
}

export function eachPlayer(action: PlayerAction): Action {
  return {
    type: "PlayerAction",
    player: "active",
    action,
  };
}

export function eachCard(card: CardFilter, action: CardAction): Action {
  return {
    type: "CardAction",
    card,
    action,
  };
}
