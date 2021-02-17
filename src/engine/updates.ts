import { PickByValueExact, PickByValue } from "utility-types";
import { PrintedProps } from "./cardprops";
import { CommandResult } from "./types";

export type Update<T> = {
  apply: (item: T) => void;
  result: (item: T) => CommandResult;
};

export const increment: <T>(amount: number, property: keyof PickByValueExact<T, number>) => Update<T> = (
  amount,
  property
) => {
  return {
    apply: (item) => {
      if (item[property] !== undefined) {
        (item[property] as any) += amount;
      }
    },
    result: (item) => {
      return item[property] !== undefined ? "full" : "none";
    },
  };
};
