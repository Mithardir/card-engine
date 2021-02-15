import { CardId } from "./state";
import { View } from "./view";

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
