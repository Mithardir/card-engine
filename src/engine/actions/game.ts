import { shuffleArray } from "../../utils";
import { negate, getProp } from "../exps";
import { and, isTapped, isCharacter, isInZone, isHero, Filter, isLocation } from "../filters";
import { PlayerDeck } from "../setup";
import { CardId, PlayerId, playerIds, createCardState, Side, Mark } from "../state";
import { ZoneKey } from "../types";
import { zoneKey, getZone, filterCards } from "../utils";
import { createView } from "../view";
import { tap, resolveDefense, dealDamage, moveCard, mark } from "./card";
import { chooseOne, chooseCardAction, chooseMultiple } from "./choices";
import { sequence, action, bind } from "./control";
import { Action, CardAction, PlayerAction } from "./types";
import { getActionChange } from "./utils";

export const playerActions: (title: string) => Action = (title) => {
  return {
    print: `playerActions`,
    do: (state) => {
      return {
        choice: {
          title,
          multiple: true,
          dialog: false,
          get choices() {
            const view = createView(state);
            const choices = view.cards
              .map((card) => card.actions.map((action) => ({ card, action })))
              .flatMap((a) => a)
              .filter((a) => getActionChange(a.action.effect, state) !== "none")
              .map((ca) => ({
                label: `${ca.card.props.name}: ${ca.action.description}`,
                action: sequence(ca.action.effect, playerActions(title)),
              }));
            return [...choices, { label: "Continue", action: sequence() }];
          },
        },
        effect: "full",
        state,
        next: undefined,
      };
    },
  };
};

export const dealShadowCards =
  // TODO dealShadowCards
  sequence();

export function declareDefender(attackerId: CardId, playerId: PlayerId): Action {
  const filter = and((id) => negate(isTapped(id)), isCharacter, isInZone(zoneKey("playerArea", playerId)));
  return {
    print: `declareDefender(${attackerId}, ${playerId})`,
    do: (state) => {
      const view = createView(state);
      const cards = filterCards(filter, view);

      const action = chooseOne("Declare defender", [
        ...cards.map((c) => ({
          image: c.props.image,
          label: c.props.name || "",
          action: sequence(tap(c.id), resolveDefense(attackerId)(c.id)),
        })),
        {
          label: "No defender",
          action: chooseCardAction(
            "Choose hero for undefended attack",
            and(isHero, isInZone(zoneKey("playerArea", playerId))),
            (hero) => bind(getProp("attack", attackerId), (attack) => dealDamage(attack)(hero))
          ),
        },
      ]);

      return action.do(state);
    },
  };
}

export function declareAttackers(attackedId: CardId, playerId: PlayerId): Action {
  const attackers = and((id) => negate(isTapped(id)), isCharacter, isInZone(zoneKey("playerArea", playerId)));
  return {
    print: `declareAttackers(${attackedId}, ${playerId})`,
    do: (state) => {
      const view = createView(state);
      const cards = filterCards(attackers, view);

      const action = chooseMultiple(
        "Declare attackers",
        cards.map((c) => ({
          image: c.props.image,
          label: c.props.name || "",
          action: sequence(tap(c.id), mark("attacking")(c.id)),
        }))
      );

      return action.do(state);
    },
  };
}

export const passFirstPlayerToken: Action = action("passFirstPlayerToken", (state) => {
  // TODO
  return "full";
});

export const travelToLocation = moveCard(zoneKey("stagingArea"), zoneKey("activeLocation"), "face");

export function placeProgress(amount: number): Action {
  return action(`place ${amount} progress`, (state) => {
    const cardId = state.zones.quest.cards[0];
    const card = state.cards.find((c) => c.id === cardId);
    if (card) {
      card.token.progress += amount;
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
    print: `eachPlayer(${factory("X").print})`,
    do: (s) => {
      const action = sequence(...s.players.map((p) => factory(p.id)));
      return action.do(s);
    },
  };
}

export function eachCard(filter: Filter<CardId>, action: CardAction): Action {
  return {
    print: `eachCard(${filter("X" as any).print}, ${action("X" as any).print})`,
    do: (state) => {
      const view = createView(state);
      const cards = filterCards(filter, view);
      const actions = sequence(...cards.map((card) => action(card.id)));
      return actions.do(state);
    },
  };
}

export function moveTopCard(from: ZoneKey, to: ZoneKey, side: Side): Action {
  return action(`moveTopCard(${from.print}, ${to.print}, "${side}")`, (state) => {
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

export function clearMarks(type: Mark): Action {
  return action(`clearQuestingMarks`, (state) => {
    for (const card of state.cards) {
      card.mark[type] = false;
    }

    return "full";
  });
}

export const chooseTravelLocation: Action = {
  print: "chooseTravelLocation",
  do: (state) => {
    const view = createView(state);
    const cards = filterCards(and(isLocation, isInZone(zoneKey("stagingArea"))), view);

    const action = chooseOne("Choose location for travel", [
      ...cards.map((c) => ({
        image: c.props.image,
        label: c.props.name || "",
        action: travelToLocation(c.id),
      })),
      {
        label: "No travel",
        action: sequence(),
      },
    ]);

    return action.do(state);
  },
};
