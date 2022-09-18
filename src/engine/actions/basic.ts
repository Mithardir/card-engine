import { Mark, Token, Side } from "../../types/basic";
import { ZoneState } from "../../types/state";
import { gameZone, zoneOf } from "../getters";
import { Getter } from "../types";
import { cardAction } from "./factories";

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

export const tap = cardAction("tap", (c) => {
  c.card.tapped = true;
});

export const untap = cardAction("untap", (c) => {
  c.card.tapped = false;
});

export const flip = cardAction<Side>("flip", (c, side) => {
  c.card.sideUp = side;
});

export const moveCard = cardAction<{
  from?: Getter<ZoneState>;
  to: Getter<ZoneState>;
  side: Side;
}>("moveCard", (c, args) => {
  const card = c.card;
  card.sideUp = args.side;
  const zoneTo = c.get(args.to);
  const zoneFrom = args.from ? c.get(args.from) : c.get(zoneOf(c.card.id));
  const inZone = zoneFrom.cards.some((c) => c === card.id);
  if (zoneTo && zoneFrom && inZone) {
    zoneFrom.cards = zoneFrom.cards.filter((c) => c !== card.id);
    zoneTo.cards.push(c.card.id);
  }
});

export const travelTo = moveCard({
  from: gameZone("stagingArea"),
  to: gameZone("activeLocation"),
  side: "face",
});
