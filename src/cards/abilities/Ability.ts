import { CardView, State } from "../../types/state";


export type Ability = {
  description: string;
  implicit: boolean;
  modify: (self: CardView, state: State) => void;
};
