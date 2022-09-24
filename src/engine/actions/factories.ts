import { CardState, State, PlayerState, CardId } from "../../types/state";
import { Action, CardAction, Getter, PlayerAction } from "../types";

export function action<T = void>(
  name: string,
  apply: (
    context: {
      run: (action: Action) => void;
      get: <T>(getter: Getter<T>) => T;
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

export type ActionResult = "none" | "partial" | "full";

export function cardAction<T = void>(
  name: string,
  apply: (
    context: {
      card: CardState;
      get: <T>(getter: Getter<T>) => T;
    },
    args: T
  ) => Action | void,
  result?: (card: CardState, s: State, args: T) => ActionResult
): (args: T) => CardAction {
  return (args) => ({
    print: `${name}(${JSON.stringify(args)})`,
    card: (ref) => {
      return {
        print: `${name}(${JSON.stringify({ ...args, card: ref })})`,
        apply: (state) => {
          const card = resolveCard(ref, state);
          if (card) {
            const action = apply(
              {
                card,
                get: <T>(getter: Getter<T>) => getter.get(state),
              },
              args
            );
            if (action) {
              action.apply(state);
            }
          }
        },
        result: result
          ? (state) => {
              const card = resolveCard(ref, state);
              if (!card) {
                return "none";
              }

              return result(card, state, args);
            }
          : undefined,
      };
    },
  });
}

export function resolveCard(
  ref: CardId | Getter<CardId | undefined>,
  state: State
) {
  if (typeof ref === "number") {
    return state.cards[ref];
  } else {
    const id = ref.get(state);
    if (id) {
      return state.cards[id];
    }
  }
}

export function playerAction<T = void>(
  name: string,
  apply: (
    context: {
      player: PlayerState;
      get: <T>(getter: Getter<T>) => T;
    },
    args: T
  ) => Action | void,
  result?: (card: PlayerState, s: State, args: T) => ActionResult
): (args: T) => PlayerAction {
  return (args) => ({
    print: `${name}(${JSON.stringify(args)})`,
    player: (id) => {
      return {
        print: `${name}(${JSON.stringify({ ...args, card: id })})`,
        apply: (state) => {
          const player = state.players[id];
          if (player) {
            const action = apply(
              {
                player,
                get: <T>(getter: Getter<T>) => getter.get(state),
              },
              args
            );
            if (action) {
              action.apply(state);
            }
          }
        },
        result: result
          ? (state) => {
              const player = state.players[id];
              if (!player) {
                return "none";
              }

              return result(player, state, args);
            }
          : undefined,
      };
    },
  });
}
