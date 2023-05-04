import { Action, GameAction, CardAction, PlayerAction } from "../types/actions";
import {
  Scenario,
  PlayerDeck,
  Phase,
  NumberValue,
  GameZoneType,
  CardFilter,
  Side,
  BoolValue,
  PlayerFilter,
  Mark,
  CardId,
  PlayerId,
} from "../types/basic";
import { and } from "./predicates";
import { gameZone } from "./zones";
import { shuffleLibrary, draw, incrementThreat } from "./playerActions";
import { topCard } from "./cardFilters";
import { reverse } from "lodash";

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

  return sequence(...reverse(addQuestCards), ...addEncounterCards);
}

export function sequence(
  ...actions: Action[]
): { type: "Sequence"; actions: Action[] };
export function sequence(
  ...actions: CardAction[]
): { type: "Sequence"; actions: CardAction[] };
export function sequence(
  ...actions: PlayerAction[]
): { type: "Sequence"; actions: PlayerAction[] };
export function sequence<T extends Action | CardAction | PlayerAction>(
  ...actions: T[]
): { type: "Sequence"; actions: T[] } {
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
    "SetupActions",
    flip("back", topCard(gameZone("questDeck"))),
    startGame()
  );
}

export function startGame(): Action {
  return {
    type: "While",
    condition: { type: "Not", value: "GameFinished" },
    action: gameRound(),
  };
}

export function whileDo(condition: BoolValue, action: Action): Action {
  return {
    type: "While",
    condition,
    action,
  };
}

export function playerActions(label: string): GameAction {
  return {
    type: "PlayerActions",
    label,
  };
}

export function clearMarks(mark: Mark): Action {
  return { type: "ClearMarks", mark };
}

export const phaseResource = sequence(
  beginPhase("resource"),
  eachPlayer(draw(1)),
  eachCard(and(["isHero", "inPlay"]), addResources(1)),
  playerActions("End resource phase"),
  endPhase()
);

export const phasePlanning = sequence(
  beginPhase("planning"),
  playerActions("End planning phase"),
  endPhase()
);

export function repeat(amount: NumberValue, action: Action): Action {
  return {
    type: "Repeat",
    amount,
    action,
  };
}

export const phaseQuest = sequence(
  beginPhase("quest"),
  eachPlayer("CommitCharactersToQuest"),
  playerActions("Staging"),
  repeat("countOfPlayers", "RevealEncounterCard"),
  playerActions("Quest resolution"),
  "ResolveQuesting",
  playerActions("End phase"),
  clearMarks("questing"),
  endPhase()
);

export const phaseTravel = sequence(
  beginPhase("travel"),
  "ChooseTravelDestination",
  playerActions("End travel phase"),
  endPhase()
);

export const phaseEncounter = sequence(
  beginPhase("encounter"),
  eachPlayer("OptionalEngagement"),
  playerActions("Engagement Checks"),
  whileDo("EnemiesToEngage", eachPlayer("EngagementCheck")),
  playerActions("Next encounter phase"),
  endPhase()
);

export const phaseCombat = sequence(
  beginPhase("combat"),
  "DealShadowCards",
  playerActions("Resolve enemy attacks"),
  eachPlayer("ResolveEnemyAttacks"),
  clearMarks("attacked"),
  playerActions("Resolve player attacks"),
  eachPlayer("ResolvePlayerAttacks"),
  clearMarks("attacked"),
  playerActions("End combat phase"),
  endPhase()
);

export const phaseRefresh = sequence(
  beginPhase("refresh"),
  eachCard("isExhausted", "Ready"),
  eachPlayer(incrementThreat(1)),
  "PassFirstPlayerToken",
  playerActions("End refresh phase and round"),
  endPhase()
);

export function beginPhase(phase: Phase): GameAction {
  return {
    type: "BeginPhase",
    phase,
  };
}

export function endPhase(): GameAction {
  return "EndPhase";
}

export function gameRound(): Action {
  return sequence(
    phaseResource,
    phasePlanning,
    phaseQuest,
    phaseTravel,
    phaseEncounter,
    phaseCombat,
    phaseRefresh,
    "EndRound"
  );
}

export function flip(side: Side, card: CardFilter): Action {
  return {
    type: "CardAction",
    card: card,
    action: {
      type: "Flip",
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

export function placeProgress(amount: NumberValue): Action {
  return {
    type: "PlaceProgress",
    amount,
  };
}

export function payCardResources(amount: NumberValue): CardAction {
  return {
    type: "PayResources",
    amount: amount,
  };
}

export function addResources(amount: NumberValue): CardAction {
  return {
    type: "AddResources",
    amount,
  };
}

export function targetCard(
  filter: CardFilter
): { to: (action: CardAction) => Action } {
  return {
    to: (action) => {
      return {
        type: "CardAction",
        action: action,
        card: filter,
      };
    },
  };
}

export function targetPlayer(
  filter: PlayerFilter
): { to: (action: PlayerAction) => Action } {
  return {
    to: (action) => {
      return {
        type: "PlayerAction",
        action: action,
        player: filter,
      };
    },
  };
}

export function choosePlayer(params: {
  filter?: PlayerFilter;
  label: string;
  action: PlayerAction;
}): Action {
  return {
    type: "ChoosePlayer",
    ...params,
  };
}

export function chooseCard(params: {
  filter: CardFilter;
  label: string;
  action: CardAction;
  optional: boolean;
}): Action {
  return {
    type: "ChooseCard",
    multi: false,
    ...params,
  };
}

export function chooseAction(params: {
  label: string;
  options: Array<{ title: string; cardId?: CardId; action: Action }>;
  optional: boolean;
}): Action {
  return {
    type: "ChooseAction",
    multi: false,
    ...params,
  };
}

export function discardCard(card: CardId): Action {
  return {
    type: "CardAction",
    card,
    action: "Discard",
  };
}

export function addToStagingArea(name: string): Action {
  return {
    type: "AddToStagingArea",
    name,
  };
}

export function atEndOfRound(action: Action): Action {
  return {
    type: "TriggerAtEndOfRound",
    action,
  };
}
