import { UI, createEngine } from "./engine/engine";
import { CardId, createInitState, createCardState, CardDefinition } from "./engine/state";
import { Engine } from "./engine/types";
import { createView } from "./engine/view";

export const testUi: UI = {
  chooseOne: async (title, items) => {
    throw new Error();
  },
  chooseMultiple: () => {
    throw new Error();
  },
  playerActions: () => {
    throw new Error();
  },
};

export function createCardProxy(cardId: CardId, engine: Engine) {
  return {
    id: cardId,
    get attack() {
      return createView(engine.state).cards.find((c) => c.id === cardId)!.props.attack!;
    },
  };
}

export function createTestEngine() {
  const state = createInitState();
  const engine = createEngine(testUi, state);

  let id = 1;

  const testEngine = {
    ...engine,
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

      return createCardProxy(cardId, engine);
    },
  };

  return testEngine;
}
