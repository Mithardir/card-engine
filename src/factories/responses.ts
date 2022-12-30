import { Action } from "../types/actions";
import { BoolValue, CardId, ResponseAbility } from "../types/basic";
import { Events } from "../types/events";

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
