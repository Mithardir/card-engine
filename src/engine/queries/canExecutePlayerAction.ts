import { sumBy } from "lodash";
import { and } from "../../factories/predicates";
import { PlayerAction } from "../../types/actions";
import { PlayerId } from "../../types/basic";
import { State } from "../../types/state";
import { evaluateNumber } from "./evaluateNumber";
import { filterCards } from "./filterCards";

export function canExecutePlayerAction(
  action: PlayerAction,
  player: PlayerId,
  state: State
): boolean {
  if (typeof action === "object") {
    switch (action.type) {
      case "PayResources": {
        const sphere = action.sphere;
        const heroes =
          sphere !== "any"
            ? filterCards(
                state,
                and([
                  "isHero",
                  { type: "HasSphere", sphere },
                  { type: "HasController", player },
                ])
              )
            : filterCards(
                state,
                and(["isHero", { type: "HasController", player }])
              );

        const resources = sumBy(heroes, (h) => h.token.resources);
        const amount = evaluateNumber(action.amount, state);
        return resources >= amount;
      }
    }
  }

  throw new Error(
    "unknwon action for canExecutePlayerAction: " +
      JSON.stringify(action, null, 1)
  );
}