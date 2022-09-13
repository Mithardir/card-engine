import { cardActionSequence, tap } from "../engine";
import { Mark } from "../types/basic";
import { cardAction } from "./factories";

export const mark = cardAction<Mark>("mark", (c, type) => {
  c.card.mark[type] = true;
});

export const commitToQuest = cardActionSequence(tap(), mark("questing"));
