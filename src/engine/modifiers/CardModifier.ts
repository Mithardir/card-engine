import { Effect } from "../types";
import { CardId } from "../../types/state";

export type CardModifier = {
  print: string;
  to: (card: CardId) => Effect;
};
