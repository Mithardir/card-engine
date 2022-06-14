import { Exp } from "../exps";
import { CardId } from "../state";
import { Keyword } from "../types";
import { CardView, View, Response, Responses } from "../view";
import { Action, CardAction } from "./types";

export type ViewModifier = { print: string; modify: (view: View) => void };

export type CardModifier = {
  print: string;
  modify: (card: CardView, view: View) => void;
};

export function modifyCard(id: CardId, modifier: CardModifier): ViewModifier {
  return {
    print: `modify card ${id}: ${modifier.print}`,
    modify: (v) => {
      const card = v.cards.find((c) => c.id === id);
      if (card) {
        modifier.modify(card, v);
      }
    },
  };
}

export function bind<T>(
  exp: Exp<T>,
  factory: (v: T) => ViewModifier
): ViewModifier {
  return {
    // TODO x
    print: factory("x" as any).print,
    modify: (view) => {
      const value = exp.eval(view);
      const modifier = factory(value);
      return modifier.modify(view);
    },
  };
}

export function bindCM<T>(
  exp: Exp<T>,
  factory: (v: T) => CardModifier
): CardModifier {
  return {
    // TODO x
    print: factory("x" as any).print,
    modify: (card, view) => {
      const value = exp.eval(view);
      const modifier = factory(value);
      return modifier.modify(card, view);
    },
  };
}

export function increment(
  property: "attack",
  amount: Exp<number>
): CardModifier {
  return {
    print: `increment ${property} by ${amount.print}`,
    modify: (c, v) => {
      const value = c.props[property];
      if (value !== undefined) {
        c.props[property] = value + amount.eval(v);
      }
    },
  };
}

export function addKeyword(keyword: Keyword): CardModifier {
  return {
    print: `add keyword ${keyword}`,
    modify: (c) => {
      c.props.keywords[keyword] = true;
    },
  };
}

export function setSetup(action: Action): CardModifier {
  return {
    print: `set setup: ${action.print}`,
    modify: (c) => (c.setup = action),
  };
}

export function addResponse<T>(
  selector: (responses: Responses) => Response<T>[],
  props: {
    description: string;

    condition: (e: T, view: View) => boolean;
    action: (e: T) => Action;
  }
): ViewModifier {
  return {
    print: props.description,
    modify: (v) => {
      const responses = selector(v.responses);
      responses.push({
        description: props.description,
        condition: props.condition,
        action: props.action,
      });
    },
  };
}

export function addAction(action: CardAction): CardModifier {
  return {
    print: "add action",
    modify: (c) => {
      c.actions.push(action);
    },
  };
}
