import { CardId } from "../state";
import { Keyword } from "../types";
import { CardView, View, Response, Responses } from "../view";
import { Action } from "./types";

export type ViewModifier = { print: string; modify: (view: View) => void };

export type CardModifier = { print: string; modify: (card: CardView) => void };

export function modifyCard(id: CardId, modifier: CardModifier): ViewModifier {
  return {
    print: `modify card ${id}: ${modifier.print}`,
    modify: (v) => {
      const card = v.cards.find((c) => c.id === id);
      if (card) {
        modifier.modify(card);
      }
    },
  };
}

export function increment(property: "attack", amount: number): CardModifier {
  return {
    print: `increment ${property} by ${amount}`,
    modify: (c) => {
      const value = c.props[property];
      if (value !== undefined) {
        c.props[property] = value + amount;
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
