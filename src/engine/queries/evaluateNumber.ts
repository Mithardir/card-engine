import { NumberValue } from "../../types/basic";
import { State } from "../../types/state";

export function evaluateNumber(expr: NumberValue, state: State) {
  if (typeof expr === "number") {
    return expr;
  }

  switch (expr) {
    case "countOfPlayers": {
      return Object.keys(state.players).length;
    }
  }

  throw new Error(`unknown expression: ${JSON.stringify(expr)}`);
}
