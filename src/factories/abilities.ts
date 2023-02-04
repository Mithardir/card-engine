import {
  Ability,
  CharacterActionAbility,
  ModifySelfAbility,
} from "../types/basic";

export function modifySelf(params: Omit<ModifySelfAbility, "type">): Ability {
  return { type: "ModifySelf", ...params };
}

export function action(params: Omit<CharacterActionAbility, "type">): Ability {
  return {
    type: "CharacterAction",
    ...params,
  };
}
