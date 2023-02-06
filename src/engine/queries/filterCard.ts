import { CardFilter } from "../../types/basic";
import { State, CardState } from "../../types/state";
import { filterCards } from "./filterCards";

export function filterCard(
  state: State,
  filter: CardFilter
): CardState | undefined {
  const cards = filterCards(state, filter);
  if (cards.length === 1) {
    return cards[0];
  } else {
    return undefined;
  }
}
