import { values } from "lodash";
import { Action } from "../../types/actions";
import { State } from "../../types/state";
import { canExecuteCardAction } from "./canExecuteCardAction";
import { canExecutePlayerAction } from "./canExecutePlayerAction";
import { filterCards } from "./filterCards";
import { filterPlayers } from "./filterPlayers";

export function canExecuteAction(action: Action, state: State): boolean {
  if (typeof action === "object") {
    switch (action.type) {
      case "Sequence":
        return action.actions.every((a) => canExecuteAction(a, state));
      case "CardAction":
        if (typeof action.card === "number") {
          return canExecuteCardAction(action.action, action.card, state);
        }
        break;
      case "PlayerAction":
        if (
          (action.player === "A" ||
            action.player === "B" ||
            action.player === "C" ||
            action.player === "D") &&
          typeof action.action !== "function"
        ) {
          return canExecutePlayerAction(action.action, action.player, state);
        }
        break;
      case "ChooseCard": {
        const cards = filterCards(state, action.filter);
        return cards.some((c) =>
          canExecuteCardAction(action.action, c.id, state)
        );
      }
      case "ChoosePlayer": {
        const players = action.filter
          ? filterPlayers(state, action.filter)
          : values(state.players);

        return players.some((p) =>
          canExecutePlayerAction(action.action, p.id, state)
        );
      }
    }
  }

  throw new Error(
    "unknwon action for canExecuteAction: " + JSON.stringify(action, null, 1)
  );
}
