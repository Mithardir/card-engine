import { Exp } from "../exps";
import { CardId, PlayerId, State } from "../state";

export type Action = {
  print: string;
  do: (state: State) => ActionResult;
};

export type ActionResult = {
  choice?:
    | {
        title: string;
        multiple: boolean;
        dialog: boolean;
        choices: Array<{
          label: string;
          image?: string | undefined;
          action: Action;
        }>;
      }
    | undefined;
  next: Action | undefined;
};

export type PlayerAction = (playerId: PlayerId) => Action;

export type CardEffect = (cardId: CardId) => Action;

export type StateTree = {
  state: State;
  next?: {
    title: string;
    choices: Array<{
      label: string;
      result: StateTree;
    }>;
  };
};

export type CardAction = {
  description: string;
  condition: Exp<boolean>;
  effect: Action;
};
