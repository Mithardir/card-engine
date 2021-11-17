import { State } from "./state";
import { sequence } from "./actions/control";
import { Action } from "./actions/types";
import { makeObservable, observable, runInAction } from "mobx";

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
  do: (action: Action) => Promise<void>;
  do2: (action: Action) => void;
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

  constructor(private ui: UI, init: State) {
    makeObservable(this);
    this.state = init;
  }

  do2(action: Action) {
    let result = action.do(this.state);
    while (true) {
      while (!result.choice) {
        if (result.next) {
          result = result.next.do(this.state);
        } else {
          return;
        }
      }

      this.choice = result.choice;
      if (result.next) {
        const text = result.next.print;
        if (!text.includes("passFirstPlayerToken") && this.next) {
          this.next = sequence(result.next, this.next);
        } else {
          this.next = result.next;
        }
      }

      return;
    }
  }

  async do(action: Action) {
    let result = runInAction(() => action.do(this.state));

    while (true) {
      while (!result.choice) {
        if (result.next) {
          result = result.next.do(this.state);
        } else {
          return;
        }
      }

      if (result.choice) {
        if (result.choice.dialog) {
          const choosen = result.choice.multiple
            ? sequence(
                ...(await this.ui.chooseMultiple(
                  result.choice.title,
                  result.choice.choices.map((c) => ({
                    label: c.label,
                    value: c.action,
                    image: c.image,
                  }))
                ))
              )
            : await this.ui.chooseOne(
                result.choice.title,
                result.choice.choices.map((c) => ({
                  ...c,
                  value: c.action,
                }))
              );

          const next = result.next;
          result = runInAction(() => choosen.do(this.state));
          if (next) {
            result.next = result.next ? sequence(result.next, next) : next;
          }
        } else {
          await this.ui.playerActions(result.choice.title);
          result.choice = undefined;
        }
      }
    }
  }
}

export function createEngine(ui: UI, init: State) {
  return new ObservableEngine(ui, init);
}
