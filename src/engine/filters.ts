import { CardId } from "./state";
import { Action } from "./types";
import { createView, View } from "./view";

export type Exp<T> = {
  print: string;
  eval: (v: View) => T;
};

export type Filter<T> = (value: T) => Exp<boolean>;

export const filterCards = (filter: Filter<CardId>, view: View) =>
  view.cards.filter((c) => filter(c.id).eval(view)).map((z) => z.id);

export const isHero: Filter<CardId> = (card) => ({
  print: "is hero",
  eval: (view) => {
    return view.cards.find((c) => c.id === card)!.props.type === "hero";
  },
});

export const isCharacter: Filter<CardId> = (card) => ({
  print: "is character",
  eval: (view) => {
    const type = view.cards.find((c) => c.id === card)!.props.type;
    return type === "hero" || type === "ally";
  },
});

export const totalWillpower: Exp<number> = {
  print: "total willpoer",
  eval: (v) => {
    return v.cards
      .filter((c) => c.commitedToQuest)
      .map((c) => c.props.willpower || 0)
      .reduce((p, c) => p + c, 0);
  },
};

export const totalThread: Exp<number> = {
  print: "total thread",
  eval: (v) => {
    return v.cards
      .filter((c) => v.zones.stagingArea.cards.includes(c.id))
      .map((c) => c.props.threat || 0)
      .reduce((p, c) => p + c, 0);
  },
};

export function diff(a: Exp<number>, b: Exp<number>): Exp<number> {
  return { print: `${a.print} - ${b.print}`, eval: (v) => a.eval(v) - b.eval(v) };
}


export function isMore(a: Exp<number>, b: Exp<number>): Exp<boolean> {
  return { print: `${a.print} > ${b.print}`, eval: (v) => a.eval(v) > b.eval(v) };
}


export function isSame(a: Exp<number>, b: Exp<number>): Exp<boolean> {
  return { print: `${a.print} == ${b.print}`, eval: (v) => a.eval(v) === b.eval(v) };
}


export function isLess(a: Exp<number>, b: Exp<number>): Exp<boolean> {
  return { print: `${a.print} < ${b.print}`, eval: (v) => a.eval(v) < b.eval(v) };
}