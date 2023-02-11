import { CardAction } from "../types/actions";
import { CardModifier, Mark, PlayerId } from "../types/basic";

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

export function exhaust(): CardAction {
  throw new Error("not implemented");
}

export function mark(mark: Mark): CardAction {
  return {
    type: "Mark",
    mark,
  };
}

export function modify(params: {
  description: string;
  modifier: CardModifier;
  until: "end_of_phase";
}): CardAction {
  throw new Error("not implemented");
}

export function engagePlayer(player: PlayerId): CardAction {
  return { type: "EngagePlayer", player };
}

export function resolveEnemyAttacking(player: PlayerId): CardAction {
  return { type: "ResolveEnemyAttacking", player };
}
