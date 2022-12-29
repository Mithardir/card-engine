import { Action } from "../types/actions";
import { Ability, BoolValue, CardId } from "../types/basic";
import { Responses } from "../types/responses";


export function response<TR extends keyof Responses>(params: {
  description: string;
  type: TR;
  condition: (e: Responses[TR], self: CardId) => BoolValue;
  action: (e: Responses[TR], self: CardId) => Action;
}): Ability {
  throw new Error("not implemented");
}
