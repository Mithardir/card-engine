import { values, keys } from "lodash";
import { PlayerZoneType } from "../../types/basic";
import { CardId, PlayerId, State } from "../../types/state";

export type Property<I, V> = {
  print: string;
  get: (item: I, state: State) => V;
};

export type Expr<T> = Property<State, T>;

export type CardProperty<T> = Property<CardId, T>;

export type Getter<T> = {
  get: (state: State) => T;
};

export type Filter<T> = {
  eval: (item: T, state: State) => boolean;
};

export function and<T>(
  a: Property<T, boolean>,
  b: Property<T, boolean>
): Property<T, boolean> {
  return {
    print: `and(${a.print} & ${b.print})`,
    get: (i, s) => a.get(i, s) && b.get(i, s),
  };
}

export const isTapped: Property<CardId, boolean> = {
  print: "isTapped",
  get: (card, state) => state.cards[card].tapped,
};

export function cardOwner(): Property<CardId, PlayerId | undefined> {
  return {
    print: "todo",
    get: (card, s) => {
      for (const player of values(s.players)) {
        for (const key of keys(player.zones)) {
          if (player.zones[key as PlayerZoneType].cards.includes(card)) {
            return player.id;
          }
        }
      }
    },
  };
}
