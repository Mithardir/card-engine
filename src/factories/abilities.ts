import { Ability, ActionAbility, ModifySelfAbility } from "../types/basic";

export function modifySelf(params: Omit<ModifySelfAbility, "type">): Ability {
  return { type: "ModifySelf", ...params };
}

export function action(params: Omit<ActionAbility, "type">): Ability {
  return {
    type: "Action",
    ...params,
  };
}
