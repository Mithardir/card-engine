import { NumberValue } from "../../types/basic";
import { State } from "../../types/state";

export function evaluateNumber(expr: NumberValue, state: State) {
  if (typeof expr === "number") {
    return expr;
  }

  if (typeof expr === "string") {
    switch (expr) {
      case "countOfPlayers": {
        return Object.keys(state.players).length;
      }
    }
  }

  switch (expr.type) {
    case "CardNumberValue": {
      const cardState = state.cards[expr.card];
      if (cardState) {
        if (expr.property === "damage") {
          return cardState.token.damage;
        } else {
          throw new Error(`unknown card property: ${expr.property}`);
        }
      } else {
        throw new Error("card not found");
      }
    }
  }

  throw new Error(`unknown expression: ${JSON.stringify(expr)}`);
}
