import { sumBy } from "lodash";
import { hasController, hasSphere } from "../../factories/cardFilters";
import { and } from "../../factories/predicates";
import { PlayerAction } from "../../types/actions";
import { PlayerId } from "../../types/basic";
import { State } from "../../types/state";
import { evaluateNumber } from "./evaluateNumber";
import { filterCards } from "./filterCards";
import { canExecuteAction } from "./canExecuteAction";

export function canExecutePlayerAction(
  action: PlayerAction,
  player: PlayerId,
  state: State
): boolean {
  if (typeof action === "function") {
    return canExecuteAction(action(player), state);
  }

  if (typeof action === "object") {
    switch (action.type) {
      case "PayResources": {
        const sphere = action.sphere;
        const heroes =
          sphere !== "any"
            ? filterCards(
                state,
                and(["isHero", hasSphere(sphere), hasController(player)])
              )
            : filterCards(state, and(["isHero", hasController(player)]));

        const resources = sumBy(heroes, (h) => h.token.resources);
        const amount = evaluateNumber(action.amount, state);
        return resources >= amount;
      }

      case "Draw": {
        return state.players[player]!.zones.library.cards.length >= 1;
      }

      case "Discard": {
        const amount = evaluateNumber(action.amount, state);
        const cards = state.players[player]!.zones.hand.cards.length;
        return cards >= amount;
      }

      case "SetFlag": {
        return state.players[player]!.flags[action.flag] !== true;
      }

      case "Sequence": {
        return action.actions.every((a) =>
          canExecutePlayerAction(a, player, state)
        );
      }
    }
  }

  throw new Error(
    "unknwon action for canExecutePlayerAction: " +
      JSON.stringify(action, null, 1)
  );
}
