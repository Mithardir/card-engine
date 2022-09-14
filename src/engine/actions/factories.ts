import { CardState, State, PlayerState } from "../../types/state";
import { Action, CardAction, Getter, PlayerAction } from "../types";

export function action<T = void>(
  name: string,
  apply: (
    context: {
      run: (action: Action) => void;
      get: <T>(getter: Getter<T>) => T | undefined;
    },
    args: T
  ) => void
): (args: T) => Action {
  return (args) => ({
    print: `${name}(${JSON.stringify(args)})`,
    apply: (state) => {
      apply(
        {
          run: (action) => {
            action.apply(state);
          },
          get: <T>(getter: Getter<T>) => getter.get(state),
        },
        args
      );
    },
  });
}

export function cardAction<T = void>(
  name: string,
  apply: (
    context: {
      card: CardState;
      run: (action: Action) => void;
      get: <T>(getter: Getter<T>) => T | undefined;
    },
    args: T
  ) => void
): (args: T) => CardAction {
  return (args) => ({
    print: `${name}(${JSON.stringify(args)})`,
    card: (id) => {
      return {
        print: `${name}(${JSON.stringify({ ...args, card: id })})`,
        apply: (state) => {
          const card =
            typeof id === "number"
              ? state.cards[id]
              : state.cards[id.get(state)!];

          if (card) {
            apply(
              {
                card,
                run: (action) => {
                  action.apply(state);
                },
                get: <T>(getter: Getter<T>) => getter.get(state),
              },
              args
            );
          }
        },
      };
    },
  });
}

export function playerAction<T = void>(
  name: string,
  apply: (
    context: {
      player: PlayerState;
      run: (action: Action) => void;
      get: <T>(getter: Getter<T>) => T | undefined;
    },
    args: T
  ) => void
): (args: T) => PlayerAction {
  return (args) => ({
    print: `${name}(${JSON.stringify(args)})`,
    player: (id) => {
      return {
        print: `${name}(${JSON.stringify({ ...args, card: id })})`,
        apply: (state) => {
          const player = state.players[id];
          if (player) {
            apply(
              {
                player,
                run: (action) => {
                  action.apply(state);
                },
                get: <T>(getter: Getter<T>) => getter.get(state),
              },
              args
            );
          }
        },
      };
    },
  });
}
