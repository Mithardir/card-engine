import { values } from "lodash";
import { CardId } from "../../types/basic";
import { State } from "../../types/state";

export function getCardsInHands(state: State): CardId[] {
  const playerCards = values(state.players).flatMap((p) => [
    ...p.zones.hand.cards,
  ]);

  return playerCards;
}
