import { CardId } from "../../../types/state";
import { zoneOf } from "../../getters";
import { cardAction } from "../factories";
import { moveCard } from "../basic";

export const attach = cardAction<CardId>("attachTo", (c, attachment) => {
  c.card.attachments.push(attachment);
  return moveCard({ to: zoneOf(c.card.id), side: "face" }).card(attachment);
});
