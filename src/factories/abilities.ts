import { Ability, CardId, CardModifier } from "../types/basic";

export function modifySelf(params: {
  description: string;
  modifier: (self: CardId) => CardModifier;
}): Ability {
  return { type: "ModifySelf", ...params };
}
