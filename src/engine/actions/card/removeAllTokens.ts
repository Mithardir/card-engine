import { cardAction } from "../factories";

export const removeAllTokens = cardAction("removeAllTokens", (c) => {
  c.card.token.damage = 0;
  c.card.token.progress = 0;
  c.card.token.resources = 0;
});
