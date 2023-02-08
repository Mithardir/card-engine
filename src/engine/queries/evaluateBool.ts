import { BoolValue } from "../../types/basic";
import { State } from "../../types/state";
import { evaluateCardPredicate } from "./evaluateCardPredicate";
import { evaluateNumber } from "./evaluateNumber";
import { evaluatePlayerPredicate } from "./evaluatePlayerPredicate";

export function evaluateBool(expr: BoolValue, state: State): boolean {
  if (typeof expr === "boolean") {
    return expr;
  }

  if (typeof expr === "string") {
    switch (expr) {
      case "EnemiesToEngage":
        // TODO enemies to engage
        return true;
      case "GameFinished":
        return !!state.result;
      default:
        throw new Error(`unknown expression: ${expr}`);
    }
  }

  switch (expr.type) {
    case "Not":
      return !evaluateBool(expr.value, state);
    case "CardBoolValue":
      return evaluateCardPredicate(state, expr.card, expr.predicate);
    case "PlayerBoolValue":
      return evaluatePlayerPredicate(state, expr.player, expr.predicate);
    case "And":
      for (const value of expr.values) {
        if (!evaluateBool(value, state)) {
          return false;
        }
      }
      return true;
    case "Or":
      for (const value of expr.values) {
        if (evaluateBool(value, state)) {
          return true;
        }
      }
      return false;
    case "IsLess": {
      return evaluateNumber(expr.a, state) < evaluateNumber(expr.b, state);
    }
    case "IsMore": {
      return evaluateNumber(expr.a, state) > evaluateNumber(expr.b, state);
    }
    default: {
      throw new Error(`unknown expression: ${JSON.stringify(expr)}`);
    }
  }
}