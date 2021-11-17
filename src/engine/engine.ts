import { State } from "./state";
import { sequence } from "./actions/control";
import { Action, ActionResult } from "./actions/types";
import { makeObservable, observable } from "mobx";

export type Choice = {
  title: string;
  multiple: boolean;
  dialog: boolean;
  choices: Array<{
    label: string;
    image?: string | undefined;
    action: Action;
  }>;
};

export type Engine = {
  state: State;
  do: (action: Action) => ActionResult | undefined;
  choice: Choice | undefined;
  next: Action | undefined;
};

export interface UI {
  chooseOne: <T>(
    title: string,
    items: Array<{ label: string; value: T; image?: string | undefined }>
  ) => Promise<T>;
  chooseMultiple: <T>(
    title: string,
    items: Array<{ label: string; value: T; image?: string | undefined }>
  ) => Promise<T[]>;
  playerActions: (title: string) => Promise<void>;
}

export class ObservableEngine implements Engine {
  @observable
  state: State;

  @observable
  choice: Choice | undefined = undefined;

  @observable
  next: Action | undefined = undefined;

  constructor(init: State) {
    makeObservable(this);
    this.state = init;
  }

  do(action: Action) {
    const next = this.next;
    let result = action.do(this.state);
    while (true) {
      while (!result.choice) {
        if (result.next) {
          result = result.next.do(this.state);
        } else {
          if (next) {
            this.next = undefined;
            this.do(next);
          }
          return;
        }
      }

      this.choice = result.choice;
      if (next) {
        this.next = result.next ? sequence(result.next, next) : next;
      } else {
        this.next = result.next;
      }

      return result;
    }
  }
}

export function createEngine(init: State) {
  return new ObservableEngine(init);
}
