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

export const moveCard = cardAction<{
  from: Getter<ZoneState>;
  to: Getter<ZoneState>;
  side: Side;
}>("moveCard", (c, args) => {
  const card = c.card;
  card.sideUp = args.side;
  const zoneTo = args.to.get(c.state);
  const zoneFrom = args.from.get(c.state);
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
    return sequence(
      mark("attacked").card(c.card.id),
      playerActions("Declare defender"),
      declareDefender(c.card.id, player)
    ).apply(c.state);
  }
);

export const dealDamage = cardAction<{
  damage: Getter<number>;
  attackers: CardId[];
}>("dealDamage", (c, args) => {
  const amount = args.damage.get(c.state);
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
    ifThenElse(
      isMore(damage, value(0)),
      dealDamage({ damage, attackers: [attacker] }).card(defender),
      sequence()
    ).apply(c.state);
  }
);

export function cardActionSequence(...actions: CardAction[]): CardAction {
  return {
    print: `sequence(${actions.map((a) => a.print).join(", ")})`,
    card: (id) => sequence(...actions.map((a) => a.card(id))),
  };
}

export const resolvePlayerAttack = cardAction<PlayerId>(
  "resolvePlayerAttack",
  (c, player) => {
    const enemy = c.card.id;
    const damage = minus(totalAttack, getProp("defense", enemy));
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
    ).apply(c.state);
  }
);

export const untap = cardAction("untap", (c) => {
  c.card.tapped = false;
});

export const tap = cardAction("tap", (c) => {
  c.card.tapped = true;
});

export const generateResource = cardAction<number>(
  "generateResource",
  (c, amount) => {
    c.card.token.resources += amount;
  }
);

export const commitToQuest = cardActionSequence(tap(), mark("questing"));
