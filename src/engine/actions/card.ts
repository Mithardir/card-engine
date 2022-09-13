import { Mark, Side, Token } from "../../types/basic";
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

export const cardActionSequence = cardAction<CardAction[]>(
  "sequence",
  (c, actions) => {
    c.run(sequence(...actions.map((a) => a.card(c.card.id))));
  }
);

export const mark = cardAction<Mark>("mark", (c, type) => {
  c.card.mark[type] = true;
});

export const addToken = cardAction<{ token: Token; amount: Getter<number> }>(
  "addToken",
  (c, args) => {
    const amount = c.get(args.amount) || 0;
    c.card.token[args.token] += amount;
  }
);

export const removeToken = cardAction<{ token: Token; amount: number }>(
  "removeToken",
  (c, args) => {
    const current = c.card.token[args.token];
    c.card.token[args.token] = Math.max(0, current - args.amount);
  }
);

export const untap = cardAction("untap", (c) => {
  c.card.tapped = false;
});

export const tap = cardAction("tap", (c) => {
  c.card.tapped = true;
});

export const moveCard = cardAction<{
  from: Getter<ZoneState>;
  to: Getter<ZoneState>;
  side: Side;
}>("moveCard", (c, args) => {
  const card = c.card;
  card.sideUp = args.side;
  const zoneTo = c.get(args.to);
  const zoneFrom = c.get(args.from);
  if (zoneTo && zoneFrom) {
    zoneFrom.cards = zoneFrom.cards.filter((c) => c !== card.id);
    zoneTo.cards.push(c.card.id);
  }
});

export const travelTo = moveCard({
  from: gameZone("stagingArea"),
  to: gameZone("activeLocation"),
  side: "face",
});

export const resolveEnemyAttack = cardAction<PlayerId>(
  "resolveEnemyAttack",
  (c, player) => {
    c.run(
      sequence(
        mark("attacked").card(c.card.id),
        playerActions("Declare defender"),
        declareDefender(c.card.id, player)
      )
    );
  }
);

export const dealDamage = cardAction<{
  damage: Getter<number>;
  attackers: CardId[];
}>("dealDamage", (c, args) => {
  const amount = c.get(args.damage);
  if (amount) {
    c.card.token.damage += amount;
  }
});

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
        dealDamage({ damage, attackers: [attacker] }).card(defender),
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
          dealDamage({ damage, attackers: [] }).card(enemy),
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
