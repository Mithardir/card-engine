import { Action } from "../types/actions";
import { ActionLimit, PlayerId } from "../types/basic";

export function eachPlayerOncePerRound(): ActionLimit {
  return {
    type: "phase",
    amount: 1,
    byPlayer: true,
  };
}

export function oncePerRound(): ActionLimit {
  return {
    type: "round",
    amount: 1,
    byPlayer: false,
  };
}

export function toAction(
  limit: ActionLimit | undefined,
  actionId: string,
  playerId: PlayerId
): Action {
  if (!limit) {
    return "Empty";
  }

  return {
    type: "Limit",
    actionId,
    limit,
    playerId,
  };
}
