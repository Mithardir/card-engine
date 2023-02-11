import { intersectionBy, isArray, last, values } from "lodash";
import { CardFilter, CardId } from "../../types/basic";
import { CardState, State } from "../../types/state";
import { getZone } from "./getZone";
import { getCardsInPlay } from "./getCardsInPlay";
import { getCardsInHands } from "../queries/getCardsInHands";
import { toView } from "../view/toView";
import { getControllingCards } from "./getControllingCards";
import { CardView, View } from "../../types/view";
import { getCardsInStagingArea } from "./getCardsInStagingArea";

export function filterCardViews(
  state: State,
  condition: (card: CardView) => boolean
): CardState[] {
  const view = toView(state);
  const cardIds = values(view.cards)
    .filter(condition)
    .map((c) => c.id);

  return cardIds.map((id) => state.cards[id]!);
}

export function mapCardViews<T>(
  state: State,
  filter: CardFilter,
  mapping: (card: CardView) => T
) {
  const cards = filterCards(state, filter);
  const view = toView(state);
  return cards.map((card) => view.cards[card.id]).map(mapping);
}

export function filterCards(state: State, filter: CardFilter): CardState[] {
  if (typeof filter === "number") {
    return [state.cards[filter]!];
  }

  if (isArray(filter)) {
    return filter.map((v) => state.cards[v]!);
  }

  const allCards = values(state.cards);
  if (typeof filter === "string") {
    if (filter === "inPlay") {
      return filterCards(state, getCardsInPlay(state));
    }
    if (filter === "isAlly") {
      return filterCardViews(state, (c) => c.props.type === "ally");
    }
    if (filter === "isCharacter") {
      return filterCardViews(
        state,
        (c) => c.props.type === "ally" || c.props.type === "hero"
      );
    }
    if (filter === "isHero") {
      return filterCardViews(state, (c) => c.props.type === "hero");
    }
    if (filter === "isTapped") {
      return allCards.filter((c) => c.tapped);
    }
    if (filter === "isReady") {
      return allCards.filter((c) => !c.tapped);
    }
    if (filter === "inHand") {
      return filterCards(state, getCardsInHands(state));
    }
    if (filter === "isEnemy") {
      return filterCardViews(state, (c) => c.props.type === "enemy");
    }
    if (filter === "inStagingArea") {
      return filterCards(state, getCardsInStagingArea(state));
    }

    return [state.cards[filter]!];
  }

  switch (filter.type) {
    case "TopCard": {
      const zone = getZone(filter.zone, state);
      if (zone.cards.length === 0) {
        return [];
      } else {
        return filterCards(state, last(zone.cards)!);
      }
    }

    case "and": {
      return filter.values
        .map((predicate) => filterCards(state, predicate))
        .reduce((p, c) => intersectionBy(p, c, (item) => item.id));
    }

    case "HasController": {
      const controlling = getControllingCards(filter.player, state);
      return filterCards(state, controlling);
    }

    case "HasMark": {
      return allCards.filter((c) => c.mark[filter.mark] === true);
    }

    case "HasResources": {
      return allCards.filter((c) => c.token.resources >= filter.amount);
    }

    case "HasSphere": {
      return filterCardViews(state, (c) => c.props.sphere === filter.sphere);
    }
  }

  throw new Error(`not implemented card filter: ${JSON.stringify(filter)} `);
}
