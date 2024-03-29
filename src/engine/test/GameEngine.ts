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

  makeChoice(title: string, index: number) {
    if (this.state.choice) {
      if (this.state.choice.title === title) {
        const action = this.state.choice.options[index].action;
        this.state.choice = undefined;
        this.do(action);
      } else {
        throw new Error(`Different choice title: ${this.state.choice.title}`);
      }
    } else {
      throw new Error("no choices");
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
    if (!this.state.players.A) {
      this.do(addPlayer({ name: "TEST A", library: [], heroes: [] }));
      return new PlayerProxy(this.state, "A");
    }

    if (!this.state.players.B) {
      this.do(addPlayer({ name: "TEST B", library: [], heroes: [] }));
      return new PlayerProxy(this.state, "B");
    }

    throw new Error("cant add new player");
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

  addToHand(card: CardDefinition, player: PlayerProxy): CardProxy {
    const id = addCard(this.state, card, "back", playerZone(player.id, "hand"));
    return new CardProxy(this.state, id);
  }

  get view() {
    return toView(this.state);
  }

  get actions() {
    const view = this.view;
    return values(view.cards).flatMap((card) =>
      card.actions.flatMap((action) => {
        const enabled = evaluateBool(action.enabled, this.state);
        if (!enabled) {
          return [];
        }
        return [
          {
            description: action.description,
            action: action.action,
          },
        ];
      })
    );
  }
}
