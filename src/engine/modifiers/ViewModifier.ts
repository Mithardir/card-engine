import { State, View } from "../../types/state";

export type ViewModifier = {
  print: string;
  modify: (view: View, state: State) => void;
};
