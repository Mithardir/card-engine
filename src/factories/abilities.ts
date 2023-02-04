import {
  Ability,
  CharacterActionAbility,
  EventActionAbility,
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

export function eventAction(params: Omit<EventActionAbility, "type">): Ability {
  return {
    type: "EventAction",
    ...params,
  };
}
