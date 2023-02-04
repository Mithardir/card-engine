import {
  intersectionBy,
  isArray,
  last,
  mapValues,
  sumBy,
  values,
} from "lodash";
import {
  chooseCard,
  eachPlayer,
  gameZone,
  incrementThreat,
  placeProgress,
  playerZone,
  repeat,
  targetCard,
  topCard,
} from "../factories/actions";
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
import { CardState, State, ZoneState } from "../types/state";
import { shuffleArray } from "../utils";
import { whileDo } from "../factories/actions";
import { createCardView, toView } from "./view";

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

export function advanceToChoiceState(
  state: State,
  onError: (error: string) => void
) {
  while (true) {
    if (state.next.length === 0) {
      return;
    }

    if (state.choice) {
      return state;
    }

    try {
      nextStep(state);
    } catch (error) {
      onError(error.message);
    }
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
      case "SetupActions": {
        const view = toView(state);
        const actions = values(mapValues(view.cards, (c) => c.setup)).map(
          (a) => a
        ) as Action[];
        state.next = [...actions, ...state.next];
        return;
      }
      case "EndPhase":
        return;
      case "EndRound":
        return;
      case "RevealEncounterCard": {
        const encounterDeck = getZone(gameZone("encounterDeck"), state);
        const cardId = encounterDeck.cards.pop();
        if (cardId) {
          state.cards[cardId].sideUp = "face";
          const view = toView(state);
          const cardType = view.cards[cardId].props.type;
          switch (cardType) {
            case "treachery":
              const discardPile = getZone(gameZone("discardPile"), state);
              discardPile.cards.push(cardId);
              break;
            case "enemy":
            case "location":
              const stagingArea = getZone(gameZone("stagingArea"), state);
              stagingArea.cards.push(cardId);
              break;
            default:
              throw new Error("unknown encounter card type: " + cardType);
          }
        } else {
          // TODO reshuffle from discard pile
        }
        return;
      }

      case "ResolveQuesting": {
        const questerIds = filterCards(state, {
          type: "HasMark",
          mark: "questing",
        }).map((c) => c.id);

        const inStagingIds = getZone(gameZone("stagingArea"), state).cards;

        const view = toView(state);

        const questers = questerIds.map((id) => view.cards[id]);
        const inStaging = inStagingIds.map((id) => view.cards[id]);

        const totalWillpower = sumBy(questers, (q) => q.props.willpower || 0);
        const totalThreat = sumBy(inStaging, (q) => q.props.threat || 0);

        const diff = totalWillpower - totalThreat;
        if (diff > 0) {
          state.next = [placeProgress(diff), ...state.next];
        }
        if (diff < 0) {
          state.next = [eachPlayer(incrementThreat(-diff)), ...state.next];
        }
        return;
      }
      case "ChooseTravelDestination": {
        const activeLocation = filterCard(
          state,
          topCard(gameZone("activeLocation"))
        );

        if (activeLocation) {
          return;
        }

        const view = toView(state);
        const choices = state.zones.stagingArea.cards.filter(
          (id) => view.cards[id].props.type === "location"
        );

        if (choices.length === 0) {
          return;
        }

        state.next = [
          chooseCard({
            label: "Choose location for traveling",
            action: "TravelTo",
            filter: choices,
            optional: true,
          }),
          ...state.next,
        ];
        return;
      }

      case "PassFirstPlayerToken":
        // TODO
        return;
      case "DealShadowCards":
        // TODO
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
        executePlayerAction(state, action.player, action.action);
        return;
      }
      case "CardAction": {
        executeCardAction(state, action.card, action.action);
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
        state.phase = action.phase;
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
      case "ClearMarks": {
        for (const card of values(state.cards)) {
          card.mark[action.mark] = false;
        }
        return;
      }
      case "Repeat": {
        const amount = evaluateNumber(action.amount, state);
        if (amount === 0) {
          return;
        } else {
          return (state.next = [
            action.action,
            repeat(amount - 1, action.action),
            ...state.next,
          ]);
        }
      }
      case "PlaceProgress": {
        // TODO add to active location
        const questCard = filterCard(state, topCard(gameZone("questDeck")));
        if (questCard) {
          questCard.token.progress += evaluateNumber(action.amount, state);
        }
        return;
      }
      case "ChooseCard": {
        const view = toView(state);
        const cards = filterCards(state, action.filter);
        const options = cards.map((c) => ({
          action: targetCard(c.id).to(action.action),
          image: c.definition.face.image,
          title: view.cards[c.id].props.name || "Unknown card",
        }));
        state.choice = {
          dialog: true,
          multi: action.multi,
          title: action.label,
          options: action.optional
            ? [...options, { action: "Empty", title: "None" }]
            : options,
        };
        return;
      }
    }
  }

  throw new Error(`unknown game action: ${JSON.stringify(action)}`);
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

export function executePlayerAction(
  state: State,
  filter: PlayerFilter,
  action: PlayerAction | ((player: PlayerId) => PlayerAction)
) {
  const players = getPlayers(state, filter);

  if (typeof action === "function") {
    for (const player of players) {
      state.next.unshift({
        type: "PlayerAction",
        player: player.id,
        action: action(player.id),
      });
    }

    return;
  }

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
      case "ChooseCard": {
        const view = toView(state);
        const cards = filterCards(state, action.filter);
        state.choice = {
          dialog: true,
          multi: action.multi,
          title: action.label,
          options: cards.map((c) => ({
            action: targetCard(c.id).to(action.action),
            image: c.definition.face.image,
            title: view.cards[c.id].props.name || "Unknown card",
          })),
        };
        break;
      }
      case "IncrementThreat": {
        player.thread += evaluateNumber(action.amount, state);
        break;
      }
      default: {
        throw new Error(`unknown player action: ${JSON.stringify(action)}`);
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

  switch (expr) {
    case "countOfPlayers": {
      return Object.keys(state.players).length;
    }
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

  if (expr === "EnemiesToEngage") {
    // TODO
    return true;
  }

  switch (expr.type) {
    case "Not": {
      return !evaluateBool(expr.value, state);
    }
  }

  throw new Error(`unknown expression: ${JSON.stringify(expr)}`);
}

export function executeCardAction(
  state: State,
  filter: CardFilter,
  action: CardAction
) {
  const cards = filterCards(state, filter);
  for (const card of cards) {
    if (typeof action === "string") {
      switch (action) {
        case "CommitToQuest":
          card.tapped = true;
          card.mark.questing = true;
          break;
        case "Tap":
          card.tapped = true;
          break;
        case "Untap":
          card.tapped = false;
          break;
        case "TravelTo":
          moveCard(state, card.id, gameZone("activeLocation"));
          break;
      }
    } else {
      switch (action.type) {
        case "Flip": {
          card.sideUp = action.side;
          break;
        }
        case "AddResources": {
          card.token.resources += evaluateNumber(action.amount, state);
          break;
        }
        default: {
          throw new Error(`unknown card action: ${JSON.stringify(action)}`);
        }
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

export function filterCard(
  state: State,
  filter: CardFilter
): CardState | undefined {
  const cards = filterCards(state, filter);
  if (cards.length === 1) {
    return cards[0];
  } else {
    return undefined;
  }
}

export function filterCards(state: State, filter: CardFilter): CardState[] {
  if (typeof filter === "number") {
    return [state.cards[filter]!];
  }

  if (isArray(filter)) {
    return filter.map((v) => state.cards[v]!);
  }

  const allCards = values(state.cards);
  if (typeof filter === "string") {
    if (filter === "inPlay") {
      return filterCards(state, getCardsInPlay(state));
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
    if (filter === "isTapped") {
      return allCards.filter((c) => c.tapped);
    }

    return [state.cards[filter]!];
  }

  switch (filter.type) {
    case "TopCard": {
      const zone = getZone(filter.zone, state);
      if (zone.cards.length === 0) {
        return [];
      } else {
        return filterCards(state, last(zone.cards)!);
      }
    }

    case "and": {
      const a = filterCards(state, filter.a);
      const b = filterCards(state, filter.b);
      return intersectionBy(a, b, (item) => item.id);
    }

    case "HasController": {
      // TODO
      return allCards.filter((c) => c.definition.face.type === "hero");
    }

    case "HasMark": {
      return allCards.filter((c) => c.mark[filter.mark] === true);
    }
  }

  throw new Error(`not implemented card filter: ${JSON.stringify(filter)} `);
}

export function moveCard(state: State, id: CardId, target: Zone) {
  const sourceZone = getZoneOfCard(state, id);
  const targetZone = getZone(target, state);
  sourceZone.cards = sourceZone.cards.filter((c) => c !== id);
  targetZone.cards.push(id);
}

export function getZoneOfCard(state: State, id: CardId): ZoneState {
  for (const zone of values(state.zones)) {
    if (zone.cards.includes(id)) {
      return zone;
    }
  }

  for (const player of values(state.players)) {
    for (const zone of values(player.zones)) {
      if (zone.cards.includes(id)) {
        return zone;
      }
    }
  }

  throw new Error("zone of card not found");
}
