import { CardId } from "./state";
import { View } from "./view";

export type Filter<T> = (
  value: T
) => {
  print: string;
  satisfies: (view: View) => boolean;
};

export const filterCards = (filter: Filter<CardId>, view: View) =>
  view.cards.filter((c) => filter(c.id).satisfies(view)).map((z) => z.id);

export const isHero: Filter<CardId> = (card) => ({
  print: "is hero",
  satisfies: (view) => {
    return view.cards.find((c) => c.id === card)!.props.type === "hero";
  },
});
