import { mapValues, sumBy, values } from "lodash";
import {
  chooseCard,
  eachPlayer,
  placeProgress,
  repeat,
  sequence,
  targetCard,
  targetPlayer,
} from "../../factories/actions";
import { gameZone, playerZone } from "../../factories/zones";
import { State } from "../../types/state";
import { shuffleArray } from "../../utils";
import { whileDo } from "../../factories/actions";
import { toView } from "../view/toView";
import { addCard } from "./addCard";
import { evaluateBool } from "../queries/evaluateBool";
import { evaluateNumber } from "../queries/evaluateNumber";
import { filterCard } from "../queries/filterCard";
import { filterCards } from "../queries/filterCards";
import { getZone } from "../queries/getZone";
import { executeCardAction } from "./executeCardAction";
import { executePlayerAction } from "./executePlayerAction";
import { incrementThreat } from "../../factories/playerActions";
import { hasMark, topCard } from "../../factories/cardFilters";
import { canExecuteCardAction } from "../queries/canExecuteCardAction";
import { moveCard } from "./moveCard";
import { filterPlayers } from "../queries/filterPlayers";
import { canExecutePlayerAction } from "../queries/canExecutePlayerAction";

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
        const actions = values(mapValues(view.cards, (c) => c.setup)).flatMap(
          (a) => a
        );
        state.next = [...actions, ...state.next];
        return;
      }
      case "EndPhase":
        for (const card of values(state.cards)) {
          card.limitUses.phase = {};
          card.modifiers = card.modifiers.filter(
            (m) => m.until !== "end_of_phase"
          );
        }
        return;
      case "EndRound":
        state.round++;
        for (const card of values(state.cards)) {
          card.limitUses.round = {};
          card.modifiers = card.modifiers.filter(
            (m) => m.until !== "end_of_round"
          );
        }
        if (state.triggers.end_of_round.length > 0) {
          state.next.unshift(sequence(...state.triggers.end_of_round));
          state.triggers.end_of_round = [];
        }
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
        const questerIds = filterCards(state, hasMark("questing")).map(
          (c) => c.id
        );

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
        if (state.firstPlayer === "A") {
          state.firstPlayer = state.players.B ? "B" : "A";
        }
        if (state.firstPlayer === "B") {
          state.firstPlayer = state.players.C ? "C" : "A";
        }
        if (state.firstPlayer === "C") {
          state.firstPlayer = state.players.D ? "D" : "A";
        }
        if (state.firstPlayer === "D") {
          state.firstPlayer = "A";
        }
        return;
      case "DealShadowCards":
        // TODO deal shadow cards
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
          limitUses: { game: {} },
          flags: {},
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
        let amount = evaluateNumber(action.amount, state);

        const activeLocation = filterCard(
          state,
          topCard(gameZone("activeLocation"))
        );

        if (activeLocation) {
          const questPoints =
            toView(state).cards[activeLocation.id].props.questPoints || 0;

          activeLocation.token.progress += amount;
          if (activeLocation.token.progress >= questPoints) {
            amount = activeLocation.token.progress - questPoints;
            activeLocation.token.progress = 0;
            moveCard(state, activeLocation.id, gameZone("discardPile"));
          }
        }

        if (amount > 0) {
          const questCard = filterCard(state, topCard(gameZone("questDeck")));
          if (questCard) {
            questCard.token.progress += amount;
          }
        }

        return;
      }
      case "ChooseCard": {
        const view = toView(state);
        const cards = filterCards(state, action.filter);
        const options = cards
          .filter((c) => canExecuteCardAction(action.action, c.id, state))
          .map((c) => ({
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
      case "ChoosePlayer": {
        const cards = filterPlayers(state, action.filter);
        const options = cards
          .filter((c) => canExecutePlayerAction(action.action, c.id, state))
          .map((c) => ({
            action: targetPlayer(c.id).to(action.action),
            title: `Player ${c.id}`,
          }));
        state.choice = {
          dialog: true,
          multi: false,
          title: action.label,
          options,
        };
        return;
      }
      case "ChooseAction": {
        state.choice = {
          dialog: true,
          multi: action.multi,
          title: action.label,
          options: action.optional
            ? [...action.options, { action: "Empty", title: "None" }]
            : action.options,
        };
        return;
      }
      case "AddToStagingArea": {
        const card = values(state.cards).find(
          (c) => c.definition.face.name === action.name
        );
        if (card) {
          card.sideUp = "face";
          moveCard(state, card.id, gameZone("stagingArea"));
        }
        return;
      }
      case "Limit": {
        const card = state.cards[action.cardId];
        const player = state.players[action.playerId];

        if (action.limit.type === "game") {
          if (player) {
            const current = player.limitUses.game[action.limit.key] || 0;
            player.limitUses.game[action.limit.key] = current + 1;
          }
        } else {
          if (card) {
            const current =
              card.limitUses[action.limit.type][action.limit.key] || 0;
            card.limitUses[action.limit.type][action.limit.key] = current + 1;
          }
        }

        return;
      }
      case "TriggerAtEndOfRound": {
        state.triggers.end_of_round.push(action.action);
        return;
      }
    }
  }

  throw new Error(`unknown game action: ${JSON.stringify(action)}`);
}
