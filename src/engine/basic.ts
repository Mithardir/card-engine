import { intersectionBy, isArray, last, values } from "lodash";
import { gameZone, playerZone } from "../factories/actions";
import { Action, CardAction, PlayerAction } from "../types/actions";
import {
  BoolValue,
  CardDefinition,
  CardFilter,
  CardId,
  NumberValue,
  PlayerFilter,
  PlayerId,
  Side,
  Zone,
} from "../types/basic";
import { CardState, PlayerState, State } from "../types/state";
import { shuffleArray } from "../utils";
import { whileDo } from "../factories/actions";

export function createState(program: Action): State {
  return {
    phase: "setup",
    players: {},
    zones: {
      activeLocation: { cards: [], stack: false },
      discardPile: { cards: [], stack: true },
      encounterDeck: { cards: [], stack: true },
      questDeck: { cards: [], stack: true },
      stagingArea: { cards: [], stack: false },
      victoryDisplay: { cards: [], stack: true },
    },
    next: [program],
    triggers: { end_of_phase: [], end_of_round: [] },
    flags: {},
    nextId: 1,
    cards: {},
  };
}

export function advanceToChoiceState(state: State) {
  while (true) {
    if (state.next.length === 0) {
      return;
    }

    if (state.choice) {
      return state;
    }

    nextStep(state);
  }
}

export function nextStep(state: State) {
  const action = state.next.shift();
  if (!action) {
    return;
  } else {
    switch (action) {
      case "Empty":
        return;
      case "EndPhase":
        return;
      case "SetupActions":
        return;
    }

    switch (action.type) {
      case "Sequence":
        state.next = [...action.actions, ...state.next];
        return;
      case "AddCard": {
        addCard(state, action.definition, action.side, gameZone(action.zone));
        return;
      }
      case "AddPlayer": {
        const playerId = !state.players.A
          ? "A"
          : !state.players.B
          ? "B"
          : state.players.C
          ? "C"
          : "D";

        state.players[playerId] = {
          id: playerId,
          thread: action.deck.heroes
            .map((h) => h.face.threatCost!)
            .reduce((p, c) => p + c, 0),
          zones: {
            hand: { cards: [], stack: false },
            library: { cards: [], stack: true },
            playerArea: { cards: [], stack: false },
            discardPile: { cards: [], stack: true },
            engaged: { cards: [], stack: false },
          },
        };

        for (const hero of action.deck.heroes) {
          addCard(state, hero, "face", playerZone(playerId, "playerArea"));
        }

        for (const card of action.deck.library) {
          addCard(state, card, "back", playerZone(playerId, "library"));
        }
        return;
      }
      case "ShuffleZone": {
        const zone = getZone(gameZone(action.zone), state);
        shuffleArray(zone.cards);
        return;
      }
      case "PlayerAction": {
        resolvePlayerAction(state, action.player, action.action);
        return;
      }
      case "CardAction": {
        resolveCardAction(state, action.card, action.action);
        return;
      }
      case "While": {
        const result = evaluateBool(action.condition, state);
        if (result) {
          state.next = [
            action.action,
            whileDo(action.condition, action.action),
            ...state.next,
          ];
        }
        return;
      }
      case "BeginPhase": {
        return;
      }
      case "PlayerActions": {
        state.choice = {
          title: action.label,
          dialog: false,
          multi: false,
          options: [],
        };
        return;
      }
    }
  }

  throw new Error(`unknown action: ${JSON.stringify(action)}`);
}

export function addCard(
  state: State,
  definition: CardDefinition,
  side: Side,
  zone: Zone
) {
  const id = state.nextId;
  state.cards[id] = {
    id,
    token: {
      damage: 0,
      progress: 0,
      resources: 0,
    },
    mark: {
      questing: false,
      attacking: false,
      defending: false,
      attacked: false,
    },
    sideUp: side,
    tapped: false,
    definition: definition,
    attachments: [],
    owner: zone.owner,
    controller: zone.owner,
  };
  state.nextId++;

  getZone(zone, state).cards.push(id);
}

export function getZone(zone: Zone, state: State) {
  if (zone.owner === "game") {
    return state.zones[zone.type];
  } else {
    return state.players[zone.owner]!.zones[zone.type];
  }
}

export function resolvePlayerAction(
  state: State,
  filter: PlayerFilter,
  action: PlayerAction
) {
  const players = getPlayers(state, filter);
  for (const player of players) {
    switch (action.type) {
      case "ShuffleZone": {
        const zone = getZone(playerZone(player.id, action.zone), state);
        shuffleArray(zone.cards);
        break;
      }
      case "Draw": {
        const amount = evaluateNumber(action.amount, state);
        for (let index = 0; index < amount; index++) {
          const top = last(player.zones.library.cards);
          if (top) {
            state.cards[top].sideUp = "face";
            player.zones.library.cards.pop();
            player.zones.hand.cards.push(top);
          }
        }
        break;
      }
      default: {
        throw new Error(`unknown action: ${JSON.stringify(action)}`);
      }
    }
  }
}

export function getPlayers(state: State, filter: PlayerFilter) {
  if (typeof filter === "string") {
    if (filter === "active") {
      return values(state.players);
    }
    if (filter === "first") {
      throw new Error("not implemented");
    }

    return [state.players[filter]!];
  } else if (isArray(filter)) {
    return filter.map((v) => state.players[v]!);
  } else {
    throw new Error("not implemented");
  }
}

export function evaluateNumber(expr: NumberValue, state: State) {
  if (typeof expr === "number") {
    return expr;
  }

  throw new Error(`unknown expression: ${JSON.stringify(expr)}`);
}

export function evaluateBool(expr: BoolValue, state: State): boolean {
  if (typeof expr === "boolean") {
    return expr;
  }

  if (expr === "GameFinished") {
    return !!state.result;
  }

  switch (expr.type) {
    case "Not": {
      return !evaluateBool(expr.value, state);
    }
  }

  throw new Error(`unknown expression: ${JSON.stringify(expr)}`);
}

export function resolveCardAction(
  state: State,
  filter: CardFilter,
  action: CardAction
) {
  const cards = getCards(state, filter);
  for (const card of cards) {
    switch (action.type) {
      case "flip": {
        card.sideUp = action.side;
        break;
      }
      case "AddResources": {
        card.token.resources += evaluateNumber(action.amount, state);
        break;
      }
      default: {
        throw new Error(`unknown action: ${JSON.stringify(action)}`);
      }
    }
  }
}

export function getCardsInPlay(state: State): CardId[] {
  const gameCards = [
    ...state.zones.activeLocation.cards,
    ...state.zones.stagingArea.cards,
  ];

  const playerCards = values(state.players).flatMap((p) => [
    ...p.zones.engaged.cards,
    ...p.zones.playerArea.cards,
  ]);

  return [...gameCards, ...playerCards];
}

export function getCards(state: State, filter: CardFilter): CardState[] {
  if (typeof filter === "number") {
    return [state.cards[filter]!];
  }

  if (isArray(filter)) {
    return filter.map((v) => state.cards[v]!);
  }

  const allCards = values(state.cards);
  if (typeof filter === "string") {
    if (filter === "inPlay") {
      return getCards(state, getCardsInPlay(state));
    }
    if (filter === "isAlly") {
      return allCards.filter((c) => c.definition.face.type === "ally");
    }
    if (filter === "isCharacter") {
      return allCards.filter(
        (c) =>
          c.definition.face.type === "ally" || c.definition.face.type === "hero"
      );
    }
    if (filter === "isHero") {
      return allCards.filter((c) => c.definition.face.type === "hero");
    }

    return [state.cards[filter]!];
  }

  switch (filter.type) {
    case "TopCard": {
      const zone = getZone(filter.zone, state);
      if (zone.cards.length === 0) {
        return [];
      } else {
        return getCards(state, last(zone.cards)!);
      }
    }

    case "and": {
      const a = getCards(state, filter.a);
      const b = getCards(state, filter.b);
      return intersectionBy(a, b, (item) => item.id);
    }
  }

  throw new Error(`not implemented card filter: ${JSON.stringify(filter)} `);
}
