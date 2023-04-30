import { max, min, values } from "lodash";
import { and } from "../../factories/predicates";
import { BoolValue } from "../../types/basic";
import { State } from "../../types/state";
import { toView } from "../view/toView";
import { evaluateCardPredicate } from "./evaluateCardPredicate";
import { evaluateNumber } from "./evaluateNumber";
import { evaluatePlayerPredicate } from "./evaluatePlayerPredicate";
import { filterCards } from "./filterCards";

export function evaluateBool(expr: BoolValue, state: State): boolean {
  if (typeof expr === "boolean") {
    return expr;
  }

  if (typeof expr === "string") {
    switch (expr) {
      case "EnemiesToEngage":
        const playerThreats = values(state.players).map((p) => p.thread);
        const enemies = filterCards(state, and(["isEnemy", "inStagingArea"]));
        const view = toView(state);
        const enemyEngagements = enemies
          .map((e) => view.cards[e.id])
          .flatMap((e) => (e.props.engagement ? [e.props.engagement] : []));
        if (enemyEngagements.length === 0 || playerThreats.length === 0) {
          return false;
        }
        return min(enemyEngagements)! <= max(playerThreats)!;
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
    case "SomeCard": {
      return filterCards(state, expr.predicate).length > 0;
    }
    default: {
      throw new Error(`unknown expression: ${JSON.stringify(expr)}`);
    }
  }
}
