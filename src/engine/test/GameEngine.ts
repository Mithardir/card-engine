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

  addHero(hero: CardDefinition): CardProxy {
    if (!this.state.players.A) {
      this.do(addPlayer({ name: "TEST A", library: [], heroes: [] }));
    }

    const id = addCard(this.state, hero, "face", playerZone("A", "playerArea"));
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
          const enabled = action.enabled(player.id, this.state);
          if (!enabled) {
            return [];
          }
          return [
            {
              description: action.description,
              player: player.id,
              action: action.action(player.id),
            },
          ];
        })
      )
    );
  }
}
