import { Action } from "../engine/actions/types";
import {
  CardId,
  createInitState,
  createCardState,
  CardDefinition,
  State,
} from "../engine/state";

export function createCardProxy(cardId: CardId, state: State) {
  return {
    id: cardId,
    get attack() {
      return state.view.cards.find((c) => c.id === cardId)!.props.attack!;
    },

    get progress() {
      return state.view.cards.find((c) => c.id === cardId)!.token.progress!;
    },
  };
}

export function createTestEngine() {
  const state = createInitState();
  let id = 1;

  const testEngine = {
    do: (action: Action, choices: string[] = []) => {
      let result = action.do(state);
      while (!result.choice && result.next) {
        result = result.next.do(state);
      }

      if (result.choice && choices.length > 0) {
        const label = choices.pop();
        const choice = result.choice.choices.find((c) => c.label === label);
        if (choice) {
          testEngine.do(choice.action, choices);
        } else {
          throw new Error(
            result.choice.choices.map((c) => c.label).join(" || ")
          );
        }
      }

      return result;
    },
    addHero: (card: CardDefinition) => {
      const cardId = id++;
      const cardState = createCardState(cardId, card, "face");
      state.cards.push(cardState);
      if (state.players.length === 0) {
        state.players.push({
          id: "A",
          thread: 0,
          zones: {
            hand: { cards: [], stack: false },
            library: { cards: [], stack: true },
            playerArea: { cards: [], stack: false },
            discardPile: { cards: [], stack: true },
            engaged: { cards: [], stack: false },
          },
        });

        state.players[0].zones.playerArea.cards.push(cardState.id);
      }

      return createCardProxy(cardId, state);
    },
    addEnemy: (card: CardDefinition) => {
      const cardId = id++;
      const cardState = createCardState(cardId, card, "face");
      state.cards.push(cardState);
      state.zones.stagingArea.cards.push(cardState.id);
      return createCardProxy(cardId, state);
    },
    addLocation: (card: CardDefinition) => {
      const cardId = id++;
      const cardState = createCardState(cardId, card, "face");
      state.cards.push(cardState);
      state.zones.activeLocation.cards.push(cardState.id);
      return createCardProxy(cardId, state);
    },
    addQuest: (card: CardDefinition) => {
      const cardId = id++;
      const cardState = createCardState(cardId, card, "face");
      state.cards.push(cardState);
      state.zones.quest.cards.push(cardState.id);
      return createCardProxy(cardId, state);
    },
  };

  return testEngine;
}
