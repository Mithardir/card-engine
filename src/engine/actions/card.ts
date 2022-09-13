import { Mark, Side } from "../../types/basic";
import { cardAction } from "../factories";
import { CardId, PlayerId, ZoneState } from "../../types/state";
import {
  gameZone,
  minus,
  getProp,
  isMore,
  value,
  totalAttack,
} from "../getters";
import { Action, CardAction, Getter } from "../types";
import {
  sequence,
  playerActions,
  declareDefender,
  ifThenElse,
  declareAttackers,
  clearMarks,
} from "./global";

export const mark = cardAction<Mark>("mark", (c, type) => {
  c.card.mark[type] = true;
});

export const commitToQuest = cardActionSequence(tap(), mark("questing"));

export function travelTo(cardId?: CardId): Action & CardAction {
  return {
    print: `travelTo(${cardId})`,
    card: (id) => travelTo(id),
    apply: (s) => {
      if (cardId) {
        moveCard(
          gameZone("stagingArea"),
          gameZone("activeLocation"),
          "face",
          cardId
        ).apply(s);
      }
    },
  };
}

export function resolveEnemyAttack(
  player: PlayerId,
  attacker?: number
): Action & CardAction {
  return {
    print: `resolveEnemyAttack(${player}, ${attacker})`,
    card: (id) => resolveEnemyAttack(player, id),
    apply: (s) => {
      if (attacker) {
        sequence(
          mark("attacked").card(attacker),
          playerActions("Declare defender"),
          declareDefender(attacker, player)
        ).apply(s);
      }
    },
  };
}

export function dealDamage(
  damage: Getter<number>,
  attackers: CardId[],
  defender?: CardId
): Action & CardAction {
  return {
    print: `dealDamage(${damage.print}, [${attackers.join(
      ", "
    )}], ${defender})`,
    card: (id) => dealDamage(damage, attackers, id),
    apply: (s) => {
      if (defender) {
        const amount = damage.get(s);
        if (amount) {
          s.cards[defender].token.damage += amount;
        }
      }
    },
  };
}

export function resolveDefense(
  attacker: CardId,
  defender?: CardId
): Action & CardAction {
  return {
    print: `resolveDefense(${attacker}, ${defender})`,
    card: (id) => resolveDefense(attacker, id),
    apply: (s) => {
      if (defender) {
        const damage = minus(
          getProp("attack", attacker),
          getProp("defense", defender)
        );
        ifThenElse(
          isMore(damage, value(0)),
          dealDamage(damage, [attacker], defender),
          sequence()
        ).apply(s);
      }
    },
  };
}

export function cardActionSequence(...actions: CardAction[]): CardAction {
  return {
    print: `cardActionSequence(${actions.map((a) => a.print).join(", ")})`,
    card: (id) => sequence(...actions.map((a) => a.card(id))),
  };
}

export function resolvePlayerAttack(
  player: PlayerId,
  enemy?: CardId
): Action & CardAction {
  return {
    print: `resolvePlayerAttack(${player}, ${enemy})`,
    card: (id) => resolvePlayerAttack(player, id),
    apply: (s) => {
      if (enemy) {
        const damage = minus(totalAttack, getProp("defense", enemy));
        sequence(
          playerActions("Declare attackers"),
          declareAttackers(enemy, player),
          playerActions("Determine combat damage"),
          ifThenElse(
            isMore(damage, value(0)),
            dealDamage(damage, [], enemy),
            sequence()
          ),
          clearMarks("attacking"),
          mark("attacked").card(enemy)
        ).apply(s);
      }
    },
  };
}

export function untap(cardId?: CardId): Action & CardAction {
  return {
    print: `untap(${cardId})`,
    card: (id) => untap(id),
    apply: (s) => {
      if (cardId) {
        const card = s.cards[cardId];
        if (card) {
          card.tapped = false;
        }
      }
    },
  };
}

export function generateResource(
  amount: number,
  cardId?: CardId
): Action & CardAction {
  return {
    print: `generateResource(${amount}, ${cardId})`,
    card: (id) => generateResource(amount, id),
    apply: (s) => {
      if (cardId) {
        s.cards[cardId].token.resources += amount;
      }
    },
  };
}

export function moveCard(
  from: Getter<ZoneState>,
  to: Getter<ZoneState>,
  side: Side,
  cardId?: CardId
): Action & CardAction {
  return {
    print: `moveCard(${to.print}, ${side},${cardId})`,
    card: (id) => moveCard(from, to, side, id),
    apply: (s) => {
      if (cardId) {
        const card = s.cards[cardId];
        if (card) {
          card.sideUp = side;
          const zoneTo = to.get(s);
          const zoneFrom = from.get(s);
          if (zoneTo && zoneFrom) {
            zoneFrom.cards = zoneFrom.cards.filter((c) => c !== cardId);
            zoneTo.cards.push(cardId);
          }
        }
      }
    },
  };
}

export function tap(cardId?: CardId): Action & CardAction {
  return {
    print: `tap(${cardId})`,
    card: (id) => tap(id),
    apply: (s) => {
      if (cardId) {
        const card = s.cards[cardId];
        if (card) {
          card.tapped = true;
        }
      }
    },
  };
}
