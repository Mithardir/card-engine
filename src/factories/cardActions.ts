import { CardAction } from "../types/actions";
import { Mark, PlayerId } from "../types/basic";
import { ModifierState } from "../types/state";

export function dealDamage(amount: number): CardAction {
  return {
    type: "DealDamage",
    amount,
  };
}

export function heal(amount: number | "all"): CardAction {
  return {
    type: "Heal",
    amount,
  };
}

export function mark(mark: Mark): CardAction {
  return {
    type: "Mark",
    mark,
  };
}

export function modify(params: ModifierState): CardAction {
  return {
    type: "AddModifier",
    ...params,
  };
}

export function engagePlayer(player: PlayerId): CardAction {
  return { type: "EngagePlayer", player };
}

export function resolveEnemyAttacking(player: PlayerId): CardAction {
  return { type: "ResolveEnemyAttacking", player };
}

export function resolvePlayerAttacking(player: PlayerId): CardAction {
  return { type: "ResolvePlayerAttacking", player };
}
