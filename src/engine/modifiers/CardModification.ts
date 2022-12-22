import { View, CardView } from "../../types/state";

export type CardModification = {
  print: string;
  modify: (card: CardView, view: View) => void;
};
