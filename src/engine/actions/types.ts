import { CardId, PlayerId, State } from "../state";

export type Action = {
  print: string;
  do: (state: State) => ActionResult;
};

export type ActionResult = {
  choice:
    | {
        title: string;
        multiple: boolean;
        dialog: boolean;
        choices: Array<{ label: string; image?: string; action: Action }>;
      }
    | undefined;
  next: Action | undefined;
};

export type PlayerAction = (playerId: PlayerId) => Action;

export type CardAction = (cardId: CardId) => Action;

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
