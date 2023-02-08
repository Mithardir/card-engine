import { Action } from "../types/actions";
import {
  Ability,
  BoolValue,
  CardId,
  CharacterActionAbility,
  EventActionAbility,
  ModifySelfAbility,
  ResponseAbility,
} from "../types/basic";
import { Events } from "../types/events";

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

export function response<TE extends keyof Events>(params: {
  description: string;
  type: TE;
  condition: (e: Events[TE], self: CardId) => BoolValue;
  action: (e: Events[TE], self: CardId) => Action;
}): ResponseAbility<TE> {
  return {
    type: "Response",
    description: params.description,
    response: {
      type: params.type,
      condition: params.condition,
      action: params.action,
    },
  };
}
