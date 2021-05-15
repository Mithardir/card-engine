import { setAutoFreeze } from "immer";
import { UI, createEngine, Engine } from "../engine/engine";
import { CardId, createInitState, createCardState, CardDefinition } from "../engine/state";
import { createView } from "../engine/view";

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
  setAutoFreeze(false);
  const engine = createEngine(testUi, createInitState());

  let id = 1;

  const testEngine = {
    ...engine,
    addHero: (card: CardDefinition) => {
      const cardId = id++;
      const cardState = createCardState(cardId, card, "face");
      engine.state.cards.push(cardState);
      if (engine.state.players.length === 0) {
        engine.state.players.push({
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

        engine.state.players[0].zones.playerArea.cards.push(cardState.id);
      }

      return createCardProxy(cardId, engine);
    },
  };

  return testEngine;
}
