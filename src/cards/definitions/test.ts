import { values, keys } from "lodash";
import { toView } from "../../engine/engine";
import { PlayerZoneType, Sphere } from "../../types/basic";
import { CardId, CardView, PlayerId, State, View } from "../../types/state";

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

const isTapped: Property<CardId, boolean> = {
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

const a = and(isTapped, isTapped);

function sum<T>(
  entities: Expr<T[]>,
  property: Property<T, number>
): Expr<number> {
  return {
    print: `total ${property.print} of ${entities.print}`,
    get: (state: State) => {
      const items = entities.get(state, state);
      return items.reduce((acc, item) => acc + property.get(item, state), 0);
    },
  };
}
