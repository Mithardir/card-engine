import { sumBy, values } from "lodash";
import { toView } from "../engine";
import { Predicate } from "../types";
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
        .map((c) => c.id);

      const resources = sumBy(heroes, (id) => state.cards[id].token.resources);
      return resources >= amount;
    },
  };
}
