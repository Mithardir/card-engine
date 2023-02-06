import { values } from "lodash";
import { CardId, CardPredicate } from "../../types/basic";
import { State } from "../../types/state";

export function evaluateCardPredicate(
  state: State,
  card: CardId,
  predicate: CardPredicate
): boolean {
  switch (predicate) {
    case "inHand": {
      return values(state.players).some((p) =>
        p.zones.hand.cards.includes(card)
      );
    }
    default: {
      throw new Error("unknown predicate: " + JSON.stringify(predicate));
    }
  }
}
