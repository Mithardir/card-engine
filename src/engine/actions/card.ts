import { Mark, Side, Token } from "../../types/basic";
import { cardAction } from "./factories";
import { CardId, PlayerId, ZoneState } from "../../types/state";
import {
  gameZone,
  minus,
  getProp,
  isMore,
  value,
  totalAttack,
  attackers,
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
import { addToken, mark, tap } from "./basic";
import { dealDamage } from "./card/dealDamage";
import { determineCombatDamage } from "./player";

export const cardActionSequence = cardAction<CardAction[]>(
  "sequence",
  (c, actions) => {
    c.run(sequence(...actions.map((a) => a.card(c.card.id))));
  }
);

export function asCardAction(action: (cardId: CardId) => Action): CardAction {
  return {
    print: action(0).print,
    card: (card) =>
      typeof card === "number" ? action(card) : sequence(/* todo */),
  };
}

export const resolveEnemyAttack = cardAction<PlayerId>(
  "resolveEnemyAttack",
  (c, player) => {
    c.run(
      sequence(
        mark("attacking").card(c.card.id),
        playerActions("Declare defender"),
        declareDefender(c.card.id, player),
        determineCombatDamage("defend").player(player),
        clearMarks("defending"),
        mark("attacked").card(c.card.id)
      )
    );
  }
);

export const resolveDefense = cardAction<CardId>(
  "resolveDefense",
  (c, attacker) => {
    const defender = c.card.id;
    const damage = minus(
      getProp("attack", attacker),
      getProp("defense", defender)
    );

    c.run(
      ifThenElse(
        isMore(damage, value(0)),
        dealDamage({ damage, attackers: value([attacker]) }).card(defender),
        sequence()
      )
    );
  }
);

export const resolvePlayerAttack = cardAction<PlayerId>(
  "resolvePlayerAttack",
  (c, player) => {
    const enemy = c.card.id;
    const damage = minus(totalAttack, getProp("defense", enemy));
    c.run(
      sequence(
        playerActions("Declare attackers"),
        declareAttackers(enemy, player),
        playerActions("Determine combat damage"),
        ifThenElse(
          isMore(damage, value(0)),
          dealDamage({ damage, attackers }).card(enemy),
          sequence()
        ),
        clearMarks("attacking"),
        mark("attacked").card(enemy)
      )
    );
  }
);

export const generateResource = (amount: Getter<number>) =>
  addToken({ token: "resources", amount });

export const commitToQuest = cardActionSequence([tap(), mark("questing")]);
