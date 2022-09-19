import { cardAction } from "../factories";

export const heal = cardAction<number | "all">(
  "heal",
  (c, amount) => {
    if (amount === "all") {
      c.card.token.damage = 0;
    } else {
      c.card.token.damage = Math.max(c.card.token.damage - amount, 0);
    }
  },
  (card, state, amount) => {
    if (card.token.damage === 0) {
      return "none";
    }

    if (amount === "all") {
      return "full";
    }

    return card.token.damage >= amount ? "full" : "partial";
  }
);
