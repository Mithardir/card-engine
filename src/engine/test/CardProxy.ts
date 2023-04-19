import { advanceToChoiceState } from "../updates/advanceToChoiceState";
import { executeCardAction } from "../updates/executeCardAction";
import { toView } from "../view/toView";
import { CardAction } from "../../types/actions";
import { CardId } from "../../types/basic";
import { State } from "../../types/state";

export class CardProxy {
  constructor(private state: State, private id: CardId) {}

  update(cardAction: CardAction) {
    executeCardAction(this.state, this.id, cardAction);
    advanceToChoiceState(this.state);
  }

  get props() {
    const view = toView(this.state);
    return view.cards[this.id].props;
  }

  get token() {
    const view = toView(this.state);
    return view.cards[this.id].token;
  }

  get responses() {
    const view = toView(this.state);
    return view.cards[this.id].responses;
  }
}
