import { PlayerAction } from "../types/actions";
import { BoolValue, PlayerId } from "../types/basic";

export function canPayCost(player: PlayerId, cost: PlayerAction): BoolValue {
  return {
    type: "PlayerBoolValue",
    player,
    predicate: {
      type: "CanPayCost",
      cost,
    },
  };
}
