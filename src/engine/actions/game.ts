import { shuffleArray } from "../../utils";
import { and, negate, isTapped, isCharacter, isInZone, filterCards, isHero, getProp, Filter } from "../filters";
import { PlayerDeck } from "../setup";
import { CardId, PlayerId, playerIds, createCardState, Side } from "../state";
import { ZoneKey } from "../types";
import { zoneKey, getZone } from "../utils";
import { createView } from "../view";
import { tap, resolveDefense, dealDamage, moveCard } from "./card";
import { sequence, chooseOne, chooseCardForAction, action, bind } from "./control";
import { Action, CardAction, PlayerAction } from "./types";

export const playerActions: (title: string) => Action = (title) => {
  return {
    print: `player actions until ${title}`,
    do: (state) => {
      return {
        choice: {
          title,
          multiple: true,
          dialog: false,
          choices: [], // TODO choices
        },
        effect: "full",
        state,
        next: undefined,
      };
    },
  };
};

export const dealShadowCards =
  // TODO all
  sequence();

export function declareDefender(attackerId: CardId, playerId: PlayerId): Action {
  const filter = and((id) => negate(isTapped(id)), isCharacter, isInZone(zoneKey("playerArea", playerId)));
  return {
    print: "declare defender",
    do: (state) => {
      const view = createView(state);
      const cards = filterCards(filter, view);

      const action = chooseOne("Declare defender", [
        ...cards.map((c) => sequence(tap(c.id), resolveDefense(attackerId)(c.id))),
        chooseCardForAction(
          "Choose hero for undefended attack",
          and(isHero, isInZone(zoneKey("playerArea", playerId))),
          (hero) => bind(getProp("attack", attackerId), (attack) => dealDamage(attack)(hero))
        ),
      ]);

      return action.do(state);
    },
  };
}

export const passFirstPlayerToken: Action = action("pass first player token", (state) => {
  // TODO
  return "full";
});

export function travelToLocation() {
  return moveCard(zoneKey("stagingArea"), zoneKey("activeLocation"), "face");
}

export function placeProgress(amount: number): Action {
  return action(`place ${amount} progress`, (state) => {
    const cardId = state.zones.quest.cards[0];
    const card = state.cards.find((c) => c.id === cardId);
    if (card) {
      card.progress += amount;
      return "full";
    } else {
      return "none";
    }
  });
}

export function shuffleZone(zoneKey: ZoneKey): Action {
  return action(`shuffle ${zoneKey.print}`, (s) => {
    const cards = getZone(zoneKey)(s).cards;
    if (cards.length >= 1) {
      shuffleArray(cards);
      return "full";
    } else {
      return "none";
    }
  });
}

export function addPlayer(playerId: PlayerId, deck: PlayerDeck): Action {
  return action(`add player ${playerId} with deck ${deck.name}`, (s) => {
    const playerIndex = playerIds.findIndex((p) => p === playerId);
    const heroes = deck.heroes.map((h, index) => createCardState(index * 5 + playerIndex + 1, h, "face"));
    const library = deck.library.map((l, index) =>
      createCardState((index + heroes.length) * 5 + playerIndex + 1, l, "back")
    );

    s.players.push({
      id: playerId,
      thread: heroes.map((h) => h.definition.face.threatCost!).reduce((p, c) => p + c, 0),
      zones: {
        hand: { cards: [], stack: false },
        library: { cards: library.map((l) => l.id), stack: true },
        playerArea: { cards: heroes.map((h) => h.id), stack: false },
        discardPile: { cards: [], stack: true },
        engaged: { cards: [], stack: false },
      },
    });

    s.cards.push(...heroes, ...library);
    return "full";
  });
}

export function eachPlayer(factory: PlayerAction): Action {
  // TODO order
  return {
    print: `each player: ${factory("X").print}`,
    do: (s) => {
      const action = sequence(...s.players.map((p) => factory(p.id)));
      return action.do(s);
    },
  };
}

export function eachCard(filter: Filter<CardId>, action: CardAction): Action {
  return {
    print: `each card (${filter(0).print}) {${action(0).print}}`,
    do: (state) => {
      const view = createView(state);
      const cards = filterCards(filter, view);
      const actions = sequence(...cards.map((card) => action(card.id)));
      return actions.do(state);
    },
  };
}

export function moveTopCard(from: ZoneKey, to: ZoneKey, side: Side): Action {
  return action(`move to card from ${from.print} to ${to.print} with ${side} side up`, (state) => {
    const fromZone = getZone(from)(state);
    const toZone = getZone(to)(state);
    if (fromZone.cards.length > 0) {
      const cardId = fromZone.cards.pop()!;
      const card = state.cards.find((c) => c.id === cardId)!;
      card.sideUp = side;
      toZone.cards.push(cardId);
      return "full";
    } else {
      return "none";
    }
  });
}
