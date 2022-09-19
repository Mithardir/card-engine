import { sumBy, values } from "lodash";
import { toView } from "../engine";
import { Action, Predicate } from "../types";
import { Sphere } from "../../types/basic";
import { PlayerId, State } from "../../types/state";

export function canPayResources(
  player: PlayerId,
  amount: number,
  sphere: Sphere
): Predicate<State> {
  return {
    print: `canPayResources(${player}, ${amount}, ${sphere})`,
    eval: (state) => {
      const view = toView(state);
      const heroes = values(state.players[player]?.zones.playerArea.cards)
        .map((c) => view.cards[c])
        .filter((c) => c.props.type === "hero")
        .filter((c) => sphere === "neutral" || c.props.sphere === sphere)
        .map((c) => c.id);

      const resources = sumBy(heroes, (id) => state.cards[id].token.resources);
      return resources >= amount;
    },
  };
}

export function canDoPartiallyAction(action: Action): Predicate<State> {
  return {
    print: `canDoPartiallyAction(${action.print})`,
    eval: (state) => {
      return action.result ? action.result(state) !== "none" : false;
    },
  };
}

export function canDoFullyAction(action: Action): Predicate<State> {
  return {
    print: `canDoFullyAction(${action.print})`,
    eval: (state) => {
      return action.result ? action.result(state) === "full" : false;
    },
  };
}
