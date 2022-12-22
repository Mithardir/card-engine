import { controllerOf } from "../getters/controllerOf";
import { Until } from "../types";
import { CardModifier } from "./CardModifier";

export function cantAttackEngagedPlayer(until?: Until): CardModifier {
  return {
    print: `cantAttackEngagedPlayer(${until})`,
    to: (card) => {
      return {
        description: `[${card}] can't attack engaged player`,
        apply: (v, state) => {
          const controller = controllerOf(card).get(state);
          if (controller) {
            v.cards[card].rules.cantAttackPlayer.push(controller);
          }
        },
        until,
      };
    },
  };
}
