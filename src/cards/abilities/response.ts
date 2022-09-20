import { CardId, CardView, Response, State } from "../../types/state";
import { Ability } from "../sets/core/quests";
import { Action } from "../../engine/types";

export function response<T>(
  selector: (responses: CardView["responses"]) => Response<T>[],
  props: {
    description: string;
    condition: (event: T, self: CardId, state: State) => boolean;
    action: (event: T, self: CardId, state: State) => Action;
  }
): Ability {
  return {
    description: props.description,
    implicit: false,
    modify: (c, s) =>
      selector(c.responses).push({
        description: props.description,
        condition: (e, s) => {
          return props.condition(e, c.id, s);
        },
        action: (e) => props.action(e, c.id, s),
      }),
  };
}
