import { Action } from "../types/actions";
import {
  Ability,
  ActionLimit,
  CardId,
  CardModifier,
  PlayerId,
} from "../types/basic";

export function modifySelf(params: {
  description: string;
  modifier: (self: CardId) => CardModifier;
}): Ability {
  return { type: "ModifySelf", ...params };
}

export function action(params: {
  description: string;
  caster?: "controller" | "any";
  limit?: (caster: PlayerId) => ActionLimit;
  cost: (caster: PlayerId, self: CardId) => Action;
  effect: Action | ((caster: PlayerId, self: CardId) => Action);
}): Ability {
  throw new Error("not implemented");
}
