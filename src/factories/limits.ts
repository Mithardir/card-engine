import { Action } from "../types/actions";
import { ActionLimit, CardId, PlayerId } from "../types/basic";

export function perRound(amount: number, key: string): ActionLimit {
  return {
    type: "round",
    key,
    amount,
  };
}

export function perGame(amount: number, key: string): ActionLimit {
  return {
    type: "game",
    key,
    amount,
  };
}

export function perPhase(amount: number, key: string): ActionLimit {
  return {
    type: "phase",
    key,
    amount,
  };
}

export function toAction(
  limit: ActionLimit,
  cardId: CardId,
  playerId: PlayerId
): Action {
  if (!limit) {
    return "Empty";
  }

  return {
    type: "Limit",
    limit,
    cardId,
    playerId,
  };
}
