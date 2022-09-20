import { CardView, Response } from "../../types/state";
import { Action } from "../types";
import { toView } from "../engine";
import { values } from "lodash";
import { chooseAction, sequence } from "./global";

export function resolveResponses<T>(
  title: string,
  selector: (responses: CardView["responses"]) => Response<T>[],
  event: T
): Action {
  return {
    print: `resolveResponses("${title}")`,
    apply: (state) => {
      const view = toView(state);
      const responses = values(view.cards)
        .flatMap((c) => selector(c.responses))
        .filter((r) => r.condition(event, state));

      // todo multiple

      if (responses.length > 0) {
        chooseAction(title, [
          ...responses.map((r) => ({
            title: r.description,
            action: r.action(event),
          })),
          {
            title: "No response",
            action: sequence(),
          },
        ]).apply(state);
      }
    },
  };
}
