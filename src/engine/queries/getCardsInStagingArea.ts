import { CardId } from "../../types/basic";
import { State } from "../../types/state";

export function getCardsInStagingArea(state: State): CardId[] {
  return state.zones.stagingArea.cards;
}
