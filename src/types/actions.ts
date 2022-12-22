import { CardDefinition, Phase } from "./basic";

interface Flavoring<FlavorT> {
  _type?: FlavorT;
}

export type Scenario = {
  name: string;
  questCards: CardDefinition[];
  encounterCards: CardDefinition[];
};

export type PlayerDeck = {
  name: string;
  heroes: CardDefinition[];
  library: CardDefinition[];
};

export type PlayerId = "A" | "B" | "C" | "D";

export type CardId = Flavor<number, "Card">;

type Flavor<T, FlavorT> = T & Flavoring<FlavorT>;

type CardAction =
  | {
      type: "flip";
      side: Side;
    }
  | { type: "AddResources"; amount: NumberValue };

type PlayerAction =
  | { type: "Draw"; amount: NumberValue }
  | { type: "ShuffleZone"; zone: PlayerZoneType };

type Zone =
  | {
      owner: "game";
      type: GameZoneType;
    }
  | { owner: PlayerId; type: PlayerZoneType };

type CardFilter =
  | CardPredicate
  | CardId
  | CardId[]
  | { type: "TopCard"; zone: Zone };

type PlayerFilter = PlayerPredicate | PlayerId | PlayerId[];

type CardPredicate =
  | "inPlay"
  | "isCharacter"
  | "isHero"
  | "isAlly"
  | { type: "and"; predicates: CardPredicate[] }
  | { type: "or"; predicates: CardPredicate[] };

type PlayerPredicate =
  | "active"
  | "first"
  | { type: "and"; predicates: PlayerPredicate[] }
  | { type: "or"; predicates: PlayerPredicate[] };

type Side = "face" | "back";

type GameZoneType =
  | "discardPile"
  | "stagingArea"
  | "activeLocation"
  | "encounterDeck"
  | "questDeck"
  | "victoryDisplay";

type PlayerZoneType =
  | "hand"
  | "library"
  | "discardPile"
  | "playerArea"
  | "engaged";

type GameAction =
  | { type: "AddPlayer"; deck: PlayerDeck }
  | {
      type: "AddCard";
      definition: CardDefinition;
      zone: GameZoneType;
      side: Side;
    }
  | { type: "ShuffleZone"; zone: GameZoneType }
  | { type: "PlayerActions"; label: string }
  | { type: "BeginPhase"; phase: Phase }
  | "EndPhase"
  | "SetupActions";

type BoolValue =
  | boolean
  | "GameFinished"
  | { type: "IsLess"; a: NumberValue; b: NumberValue }
  | { type: "IsMore"; a: NumberValue; b: NumberValue }
  | { type: "And"; a: BoolValue; b: BoolValue }
  | { type: "Or"; a: BoolValue; b: BoolValue }
  | { type: "Not"; value: BoolValue };

type NumberValue = "SumA" | "SumN" | number;

type Action =
  | GameAction
  | {
      type: "CardAction";
      card: CardFilter;
      action: CardAction;
    }
  | {
      type: "PlayerAction";
      player: PlayerFilter;
      action: PlayerAction;
    }
  | { type: "Sequence"; actions: Action[] }
  | {
      type: "IfThenElse";
      condition: BoolValue;
      then: Action;
      else: Action;
    }
  | { type: "While"; condition: BoolValue; action: Action }
  | "Empty";

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

function setupActions(): Action {
  return "SetupActions";
}

function startGame(): Action {
  return {
    type: "While",
    condition: { type: "Not", value: "GameFinished" },
    action: gameRound(),
  };
}

function playerActions(label: string): GameAction {
  return {
    type: "PlayerActions",
    label,
  };
}

function phaseResource(): Action {
  return sequence(
    beginPhase("resource"),
    eachPlayer(draw(1)),
    eachCard(and("isHero", "inPlay"), generateResource(1)),
    playerActions("End resource phase"),
    endPhase()
  );
}

function beginPhase(phase: Phase): GameAction {
  return {
    type: "BeginPhase",
    phase,
  };
}

function endPhase(): GameAction {
  return "EndPhase";
}

function and<T extends CardPredicate | PlayerPredicate>(
  ...predicates: T[]
): { type: "and"; predicates: T[] } {
  return { type: "and", predicates };
}

function generateResource(amount: NumberValue): CardAction {
  return {
    type: "AddResources",
    amount,
  };
}

function gameRound(): Action {
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

function gameZone(type: GameZoneType): Zone {
  return {
    owner: "game",
    type,
  };
}

function topCard(zone: Zone): CardFilter {
  return {
    type: "TopCard",
    zone,
  };
}

function flip(side: Side, card: CardFilter): Action {
  return {
    type: "CardAction",
    card: card,
    action: {
      type: "flip",
      side,
    },
  };
}

function shuffleZone(zone: GameZoneType): GameAction {
  return {
    type: "ShuffleZone",
    zone,
  };
}

function shuffleLibrary(): PlayerAction {
  return {
    type: "ShuffleZone",
    zone: "library",
  };
}

function draw(amount: NumberValue): PlayerAction {
  return {
    type: "Draw",
    amount,
  };
}

function eachPlayer(action: PlayerAction): Action {
  return {
    type: "PlayerAction",
    player: "active",
    action,
  };
}

function eachCard(card: CardFilter, action: CardAction): Action {
  return {
    type: "CardAction",
    card,
    action,
  };
}

function setupScenario(scenario: Scenario): Action {
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
