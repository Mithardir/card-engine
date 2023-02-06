import { intersectionBy, isArray, last, values } from "lodash";
import { CardFilter } from "../../types/basic";
import { CardState, State } from "../../types/state";
import { getZone } from "./getZone";
import { getCardsInPlay } from "./getCardsInPlay";
import { getCardsInHands } from "../queries/getCardsInHands";

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
      // TODO from view
      return allCards.filter((c) => c.definition.face.type === "ally");
    }
    if (filter === "isCharacter") {
      // TODO from view
      return allCards.filter(
        (c) =>
          c.definition.face.type === "ally" || c.definition.face.type === "hero"
      );
    }
    if (filter === "isHero") {
      // TODO from view
      return allCards.filter((c) => c.definition.face.type === "hero");
    }
    if (filter === "isTapped") {
      return allCards.filter((c) => c.tapped);
    }
    if (filter === "inHand") {
      return filterCards(state, getCardsInHands(state));
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
      // TODO
      return allCards.filter((c) => c.definition.face.type === "hero");
    }

    case "HasMark": {
      return allCards.filter((c) => c.mark[filter.mark] === true);
    }

    case "HasResources": {
      return allCards.filter((c) => c.token.resources >= filter.amount);
    }

    case "HasSphere": {
      // TODO from view
      return allCards.filter((c) => c.definition.face.sphere === filter.sphere);
    }
  }

  throw new Error(`not implemented card filter: ${JSON.stringify(filter)} `);
}
