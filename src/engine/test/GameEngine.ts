import { values } from "lodash";
import { createState } from "../../engine/createState";
import { addCard } from "../../engine/updates/addCard";
import { advanceToChoiceState } from "../../engine/updates/advanceToChoiceState";
import { playerZone } from "../../factories/zones";
import { CardDefinition } from "../../types/cards";
import { toView } from "../view/toView";
import { CardProxy } from "./CardProxy";
import { Action } from "../../types/actions";
import { addPlayer } from "../../factories/actions";
import { PlayerProxy } from "./PlayerProxy";
import { evaluateBool } from "../queries/evaluateBool";

export class GameEngine {
  constructor(public state = createState()) {
    advanceToChoiceState(state);
    state.choice = undefined;
    state.next = [];
  }

  do(action: Action) {
    this.state.next.unshift(action);
    advanceToChoiceState(this.state);
  }

  doAction(title: string) {
    const action = this.actions.find((a) => a.description === title);
    if (action) {
      this.do(action.action);
    } else {
      throw new Error(
        "action not found, choices are: \r\n" +
          this.actions.map((o) => o.description).join("\r\n")
      );
    }
  }

  chooseOption(title: string) {
    if (!this.state.choice) {
      throw new Error("no choice");
    }

    const option = this.state.choice.options.find((o) => o.title === title);

    if (option) {
      this.state.choice = undefined;
      this.do(option.action);
    } else {
      throw new Error(
        "option not found, choices are: \r\n" +
          this.state.choice.options.map((o) => o.title).join("\r\n")
      );
    }
  }

  private ensurePlayerA() {
    if (!this.state.players.A) {
      this.addPlayer();
    }
  }

  addPlayer() {
    this.do(addPlayer({ name: "TEST A", library: [], heroes: [] }));
    return new PlayerProxy(this.state, "A");
  }

  addHero(hero: CardDefinition): CardProxy {
    this.ensurePlayerA();

    const id = addCard(this.state, hero, "face", playerZone("A", "playerArea"));
    return new CardProxy(this.state, id);
  }

  addToLibrary(card: CardDefinition): CardProxy {
    this.ensurePlayerA();

    const id = addCard(this.state, card, "back", playerZone("A", "library"));
    return new CardProxy(this.state, id);
  }

  get view() {
    return toView(this.state);
  }

  get actions() {
    const view = this.view;
    return values(view.cards).flatMap((card) =>
      card.actions.flatMap((action) =>
        values(this.state.players).flatMap((player) => {
          const enabled = evaluateBool(action.enabled, this.state);
          if (!enabled) {
            return [];
          }
          return [
            {
              description: action.description,
              player: player.id,
              action: action.action,
            },
          ];
        })
      )
    );
  }
}
