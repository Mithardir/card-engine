import { diff, getProp } from "../exps";
import { CardId, PlayerId, Side } from "../state";
import { Token, ZoneKey } from "../types";
import { zoneKey, getZone } from "../utils";
import { createView } from "../view";
import { repeat, sequence, action, bind } from "./control";
import { playerActions, declareDefender, declareAttackers } from "./game";
import { Action, CardAction } from "./types";

export function dealDamage(amount: number): CardAction {
  return (card) => repeat(amount, addToken("damage")(card));
}

export function resolveDefense(attacker: CardId): CardAction {
  return (defender) =>
    bind(diff(getProp("attack", attacker), getProp("defense", defender)), (damage) =>
      damage > 0 ? dealDamage(damage)(defender) : sequence()
    );
}

export function engagePlayer(player: PlayerId): CardAction {
  return moveCard(zoneKey("stagingArea"), zoneKey("engaged", player), "face");
}

export function resolveEnemyAttack(playerId: PlayerId): CardAction {
  return (attackerId) => {
    // TODO shadow effect
    return sequence(playerActions("Declare defender"), declareDefender(attackerId, playerId));
  };
}

export function resolvePlayerAttack(playerId: PlayerId): CardAction {
  return (attackedId) => {
    return sequence(playerActions("Declare attackers"), declareAttackers(attackedId, playerId));
  };
}

export function generateResource(amount: number): CardAction {
  return (id) => repeat(amount, addToken("resources")(id));
}

export function commitToQuest(cardId: CardId): Action {
  return sequence(tap(cardId), assignToQuest(cardId));
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

export function assignToQuest(cardId: CardId): Action {
  return action(`assignToQuest(${cardId})`, (state) => {
    const card = state.cards.find((c) => c.id === cardId);
    if (card && !card.commitedToQuest) {
      card.commitedToQuest = true;
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
        card[type] += 1;
        return "full";
      }
    });
}

export function removeToken(type: Token): CardAction {
  return (cardId) =>
    action(`add ${type} token to card ${cardId}`, (state) => {
      const card = state.cards.find((c) => c.id === cardId);
      if (!card || !card[type]) {
        return "none";
      } else {
        card[type] -= 1;
        return "full";
      }
    });
}

export function moveCard(from: ZoneKey, to: ZoneKey, side: Side): CardAction {
  return (cardId) =>
    action(`moveCard(${cardId}, ${from.print}, ${to.print}, "${side}")`, (s) => {
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

export const playAlly: CardAction = (cardId) => {
  // TODO  pay cost
  return {
    print: `play ally ${cardId}`,
    do: (s) => {
      const owner = s.players.find((p) => p.zones.hand.cards.includes(cardId));
      const view = createView(s);
      const card = view.cards.find((c) => c.id === cardId);
      if (owner && card?.props.type === "ally") {
        return moveCard(zoneKey("hand", owner.id), zoneKey("playerArea", owner.id), "face")(cardId).do(s);
      } else {
        return sequence().do(s);
      }
    },
  };
};
