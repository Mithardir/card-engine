import produce from "immer";
import { shuffleArray } from "../utils";
import { action, Action2, CardAction, sequence } from "./actions2";
import { Exp } from "./filters";
import { PlayerDeck, Scenario } from "./setup";
import { CardId, createCardState, GameZoneType, PlayerId, playerIds, PlayerZoneType, Side } from "./state";
import { CommandResult, Token, ZoneKey } from "./types";
import { getZone, mergeAndResults } from "./utils";
import { createView } from "./view";

export function zoneKey(type: PlayerZoneType, player: PlayerId): ZoneKey;
export function zoneKey(type: GameZoneType): ZoneKey;
export function zoneKey(type: PlayerZoneType | GameZoneType, player?: PlayerId): ZoneKey {
  return {
    type,
    player,
    print: player ? `${type} of player ${player}` : type,
  } as ZoneKey;
}

export function moveTopCard(from: ZoneKey, to: ZoneKey, side: Side): Action2 {
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

export function moveCard(from: ZoneKey, to: ZoneKey, side: Side): CardAction {
  return (cardId) =>
    action(`move to card ${cardId} from ${from.print} to ${to.print} with ${side} side up`, (s) => {
      const fromZone = getZone(from)(s);
      const toZone = getZone(to)(s);
      if (fromZone.cards.includes(cardId)) {
        fromZone.cards = fromZone.cards.filter((c) => c !== cardId);
        const card = s.cards.find((c) => c.id === cardId)!;
        card.sideUp = side;
        toZone.cards.push(cardId);
        return "full";
      } else {
        return "none";
      }
    });
}

export function addToken(type: Token): CardAction {
  return (cardId) =>
    action(`add ${type} token to card ${cardId}`, (state) => {
      const card = state.cards.find((c) => c.id === cardId);
      if (!card) {
        return "none";
      } else {
        card[type] += 1;
        return "full";
      }
    });
}

export function repeat(amount: number, action: Action2): Action2 {
  return {
    print: `repeat ${amount}x: [${action.print}]`,
    do: (s) => {
      return sequence(...Array.from(new Array(amount)).map((_) => action)).do(s);
    },
  };
}

export function setupScenario(scenario: Scenario): Action2 {
  return action(`setup scenario ${scenario.name}`, (s) => {
    const quest = scenario.questCards.map((q, index) => createCardState(index * 5 + 5, q, "back"));
    const cards = scenario.encounterCards.map((e, index) => createCardState((index + quest.length) * 5 + 5, e, "back"));

    s.zones.encounterDeck.cards.push(...cards.map((c) => c.id));
    s.zones.questDeck.cards.push(...quest.map((c) => c.id));

    s.cards.push(...quest, ...cards);
    return "full";
  });
}

export function addPlayer(playerId: PlayerId, deck: PlayerDeck): Action2 {
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

export function shuffleZone(zoneKey: ZoneKey): Action2 {
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

export function tap(cardId: CardId): Action2 {
  return action(`tap card ${cardId}`, (state) => {
    const card = state.cards.find((c) => c.id === cardId);
    if (!card || card.tapped) {
      return "none";
    } else {
      card.tapped = true;
      return "full";
    }
  });
}

export function untap(cardId: CardId): Action2 {
  return action(`untap card ${cardId}`, (state) => {
    const card = state.cards.find((c) => c.id === cardId);
    if (!card || !card.tapped) {
      return "none";
    } else {
      card.tapped = false;
      return "full";
    }
  });
}

export function assignToQuest(cardId: CardId): Action2 {
  return action(`assign card ${cardId} to quest `, (state) => {
    const card = state.cards.find((c) => c.id === cardId);
    if (card && !card.commitedToQuest) {
      card.commitedToQuest = true;
      return "full";
    } else {
      return "none";
    }
  });
}
