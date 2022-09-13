import { CardState, State, PlayerState } from "../types/state";
import { CardAction, PlayerAction } from "./types";

export function cardAction<T = void>(
  name: string,
  apply: (context: { card: CardState; state: State }, args: T) => void
): (args: T) => CardAction {
  return (args) => ({
    print: `${name}(${JSON.stringify(args)})`,
    card: (id) => {
      return {
        print: `${name}(${JSON.stringify({ ...args, card: id })})`,
        apply: (state) => {
          const card = state.cards[id];
          if (card) {
            apply({ state, card }, args);
          }
        },
      };
    },
  });
}

export function playerAction<T = void>(
  name: string,
  apply: (context: { player: PlayerState; state: State }, args: T) => void
): (args: T) => PlayerAction {
  return (args) => ({
    print: `${name}(${JSON.stringify(args)})`,
    player: (id) => {
      return {
        print: `${name}(${JSON.stringify({ ...args, card: id })})`,
        apply: (state) => {
          const player = state.players[id];
          if (player) {
            apply({ state, player }, args);
          }
        },
      };
    },
  });
}
