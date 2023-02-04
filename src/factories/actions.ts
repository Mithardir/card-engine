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
  BoolValue,
  PlayerFilter,
  CardModifier,
  Mark,
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
  eachCard(and("isHero", "inPlay"), addResources(1)),
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

const commitCharactersToQuest: (id: PlayerId) => PlayerAction = (
  player: PlayerId
) => {
  return playerChooseCards({
    action: "CommitToQuest",
    label: "Choose characters commiting to quest",
    filter: { type: "HasController", player: player },
  });
};

export const phaseQuest = sequence(
  beginPhase("quest"),
  eachPlayer(commitCharactersToQuest),
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
  //eachPlayer(optionalEngagement()),
  playerActions("Engagement Checks"),
  //whileDo("EnemiesToEngage", eachPlayer(engagementCheck())),
  playerActions("Next encounter phase"),
  endPhase()
);

export const phaseCombat = sequence(
  beginPhase("combat"),
  "DealShadowCards",
  playerActions("Resolve enemy attacks"),
  //eachPlayer(resolveEnemyAttacks()),
  clearMarks("attacked"),
  playerActions("Resolve player attacks"),
  //eachPlayer(resolvePlayerAttacks()),
  clearMarks("attacked"),
  playerActions("End combat phase"),
  endPhase()
);

export const phaseRefresh = sequence(
  beginPhase("refresh"),
  eachCard("isTapped", "Untap"),
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

export function and<T extends CardPredicate | PlayerPredicate>(
  a: T,
  b: T
): { type: "and"; a: T; b: T } {
  return { type: "and", a, b };
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

export function eachPlayer(
  action: PlayerAction | ((player: PlayerId) => PlayerAction)
): Action {
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

export function dealDamage(amount: number): CardAction {
  return {
    type: "DealDamage",
    amount,
  };
}

export function heal(amount: number | "all"): CardAction {
  return {
    type: "Heal",
    amount,
  };
}

export function incrementThreat(amount: number): PlayerAction {
  return {
    type: "IncrementThreat",
    amount,
  };
}

export function payCardResources(amount: number): CardAction {
  throw new Error("not implemented");
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

export function discard(amount: NumberValue): PlayerAction {
  throw new Error("not implemented");
}

export function exhaust(): CardAction {
  throw new Error("not implemented");
}

export function modify(params: {
  description: string;
  modifier: CardModifier;
  until: "end_of_phase";
}): CardAction {
  throw new Error("not implemented");
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

export function playerChooseCard(params: {
  filter: CardFilter;
  label: string;
  action: CardAction;
}): PlayerAction {
  return {
    type: "ChooseCard",
    multi: false,
    ...params,
  };
}

export function playerChooseCards(params: {
  filter: CardFilter;
  label: string;
  action: CardAction;
}): PlayerAction {
  return {
    type: "ChooseCard",
    multi: true,
    ...params,
  };
}
