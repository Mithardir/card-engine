import { findZoneOf } from "../../cards/definitions/attachment";
import {
  attackers as getAttackers,
  diff,
  getProp,
  getTokens,
  isMoreOrEqual,
  totalAttack,
} from "../exps";
import { CardId, Mark, PlayerId, Side } from "../state";
import { Token, ZoneKey } from "../types";
import { zoneKey, getZone } from "../utils";
import { Responses, Response, createView } from "../view";
import { chooseOrder } from "./choices";
import { repeat, sequence, action, bind, ifThen } from "./control";
import {
  playerActions,
  declareDefender,
  declareAttackers,
  clearMarks,
} from "./game";
import { Action, CardAction } from "./types";
import { find } from "lodash";

export function dealDamage(amount: number, attackers: CardId[]): CardAction {
  return (card) =>
    sequence(
      repeat(amount, addToken("damage")(card)),
      ifThen(
        isMoreOrEqual(getTokens("damage", card), getProp("hitPoints", card)),
        destroy(attackers)(card)
      )
    );
}

export function resolveDefense(attacker: CardId): CardAction {
  return (defender) =>
    bind(
      diff(getProp("attack", attacker), getProp("defense", defender)),
      (damage) =>
        damage > 0 ? dealDamage(damage, [attacker])(defender) : sequence()
    );
}

export function engagePlayer(player: PlayerId): CardAction {
  return moveCard(zoneKey("stagingArea"), zoneKey("engaged", player), "face");
}

export function resolveEnemyAttack(playerId: PlayerId): CardAction {
  return (attackerId) => {
    // TODO shadow effect
    return sequence(
      playerActions("Declare defender"),
      declareDefender(attackerId, playerId)
    );
  };
}

export function resolvePlayerAttack(playerId: PlayerId): CardAction {
  return (defenderId) => {
    return sequence(
      playerActions("Declare attackers"),
      declareAttackers(defenderId, playerId),
      playerActions("Determine combat damage"),
      bind(diff(totalAttack, getProp("defense", defenderId)), (damage) =>
        damage > 0
          ? bind(getAttackers, (attackers) =>
              dealDamage(damage, attackers)(defenderId)
            )
          : sequence()
      ),
      clearMarks("attacking"),
      mark("attacked")(defenderId)
    );
  };
}

export function generateResource(amount: number): CardAction {
  return (id) => repeat(amount, addToken("resources")(id));
}

export function commitToQuest(cardId: CardId): Action {
  return sequence(tap(cardId), mark("questing")(cardId));
}

export function tap(cardId: CardId): Action {
  return action(`tapCard(${cardId})`, (state) => {
    const card = state.cards.find((c) => c.id === cardId);
    if (!card || card.tapped) {
      return "none";
    } else {
      card.tapped = true;
      return "full";
    }
  });
}

export function setSide(side: Side): CardAction {
  return (cardId) =>
    action(`setSide(${cardId})`, (state) => {
      const card = state.cards.find((c) => c.id === cardId);
      if (card && card.sideUp !== side) {
        card.sideUp = side;
      }
    });
}

export function untap(cardId: CardId): Action {
  return action(`untap(${cardId})`, (state) => {
    const card = state.cards.find((c) => c.id === cardId);
    if (!card || !card.tapped) {
      return "none";
    } else {
      card.tapped = false;
      return "full";
    }
  });
}

export function mark(type: Mark): CardAction {
  return (cardId) =>
    action(`mark(${type})`, (state) => {
      const card = state.cards.find((c) => c.id === cardId);
      if (card && !card.mark[type]) {
        card.mark[type] = true;
        return "full";
      } else {
        return "none";
      }
    });
}

export function addToken(type: Token): CardAction {
  return (cardId) =>
    action(`addToken(${type}, ${cardId})`, (state) => {
      const card = state.cards.find((c) => c.id === cardId);
      if (!card) {
        return "none";
      } else {
        card.token[type] += 1;
        return "full";
      }
    });
}

export function removeToken(type: Token): CardAction {
  return (cardId) =>
    action(`remove ${type} token from card ${cardId}`, (state) => {
      const card = state.cards.find((c) => c.id === cardId);
      if (!card || !card.token[type]) {
        return "none";
      } else {
        card.token[type] -= 1;
        return "full";
      }
    });
}

export function moveCard(from: ZoneKey, to: ZoneKey, side: Side): CardAction {
  return (cardId) =>
    action(
      `moveCard(${cardId}, ${from.print}, ${to.print}, "${side}")`,
      (s) => {
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
      }
    );
}

export function moveCardTo(to: ZoneKey, side: Side): CardAction {
  return (cardId) =>
    action(`moveCardTo(${cardId}, ${to.print}, "${side}")`, (s) => {
      const fromZone = findZoneOf(cardId, s);
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

export const removeTokensAndMarks: CardAction = (cardId) =>
  action("removeTokensAndMarks", (s) => {
    const card = s.cards.find((c) => c.id === cardId)!;
    card.mark.attacked = false;
    card.mark.attacking = false;
    card.mark.defending = false;
    card.mark.questing = false;
    card.token.damage = 0;
    card.token.progress = 0;
    card.token.resources = 0;
    card.tapped = false;
    card.attachedTo = undefined;
    return "full";
  });

export function processResponses<T>(
  selector: (r: Responses) => Array<Response<T>>,
  event: T,
  choiceTitle: string
): Action {
  return {
    print: "process responses",
    do: (s) => {
      const view = createView(s);
      const list = selector(view.responses);

      return chooseOrder("Choose next response", [
        ...list.map((l, i) => ({
          label: l.description,
          action: l.action(event),
          id: i.toString(),
        })),
        { label: "No response", action: sequence(), id: "none" },
      ]).do(s);
    },
  };
}

export const destroy: (attackers: CardId[]) => CardAction = (attackers) => (
  cardId
) => {
  return {
    print: `destroy ${cardId}`,
    do: (s) => {
      const owner = find(
        s.players,
        (p) =>
          p!.zones.hand.cards.includes(cardId) ||
          p!.zones.playerArea.cards.includes(cardId)
      );
      const view = s.view;
      const card = view.cards.find((c) => c.id === cardId);

      const response = processResponses(
        (r) => r.destroyed,
        { cardId, attackers },
        "Choose response for destroying " + cardId
      );

      if (owner && card) {
        return sequence(
          removeTokensAndMarks(cardId),
          moveCardTo(zoneKey("discardPile", owner.id), "face")(cardId),
          response
        ).do(s);
      } else if (!owner && card) {
        return sequence(
          removeTokensAndMarks(cardId),
          moveCardTo(zoneKey("discardPile"), "face")(cardId),
          response
        ).do(s);
      } else {
        return sequence().do(s);
      }
    },
  };
};
