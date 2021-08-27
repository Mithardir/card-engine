import { setAutoFreeze } from "immer";
import { UI, createEngine, Engine } from "../engine/engine";
import {
  CardId,
  createInitState,
  createCardState,
  CardDefinition,
} from "../engine/state";

export const testUi: (choices: any[]) => UI = (choices) => {
  return {
    chooseOne: async (title, items) => {
      return items[choices.pop()].value;
    },
    chooseMultiple: () => {
      throw new Error();
    },
    playerActions: () => {
      throw new Error();
    },
  };
};

export function createCardProxy(cardId: CardId, engine: Engine) {
  return {
    id: cardId,
    get attack() {
      return engine.state.view.cards.find((c) => c.id === cardId)!.props
        .attack!;
    },

    get progress() {
      return engine.state.view.cards.find((c) => c.id === cardId)!.token
        .progress!;
    },
  };
}

export function createTestEngine(choices: any[] = []) {
  setAutoFreeze(false);
  const engine = createEngine(testUi(choices), createInitState());

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
    addEnemy: (card: CardDefinition) => {
      const cardId = id++;
      const cardState = createCardState(cardId, card, "face");
      engine.state.cards.push(cardState);
      engine.state.zones.stagingArea.cards.push(cardState.id);
      return createCardProxy(cardId, engine);
    },
    addLocation: (card: CardDefinition) => {
      const cardId = id++;
      const cardState = createCardState(cardId, card, "face");
      engine.state.cards.push(cardState);
      engine.state.zones.activeLocation.cards.push(cardState.id);
      return createCardProxy(cardId, engine);
    },
    addQuest: (card: CardDefinition) => {
      const cardId = id++;
      const cardState = createCardState(cardId, card, "face");
      engine.state.cards.push(cardState);
      engine.state.zones.quest.cards.push(cardState.id);
      return createCardProxy(cardId, engine);
    },
  };

  return testEngine;
}
