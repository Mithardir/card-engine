import { setAutoFreeze } from "immer";
import { Action } from "../engine/actions/types";
import { UI, createEngine, Engine } from "../engine/engine";
import {
  CardId,
  createInitState,
  createCardState,
  CardDefinition,
} from "../engine/state";

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
      return engine.state.view.cards.find((c) => c.id === cardId)!.props
        .attack!;
    },

    get progress() {
      return engine.state.view.cards.find((c) => c.id === cardId)!.token
        .progress!;
    },
  };
}

export function createTestEngine() {
  setAutoFreeze(false);
  const engine = createEngine(testUi, createInitState());

  let id = 1;

  const testEngine = {
    ...engine,
    do: (action: Action, choices: string[] = []) => {
      let result = action.do(engine.state);
      while (!result.choice && result.next) {
        result = result.next.do(engine.state);
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
