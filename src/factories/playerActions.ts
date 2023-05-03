import { PlayerAction, CardAction } from "../types/actions";
import { NumberValue, CardFilter, CardId } from "../types/basic";
import { Sphere } from "../types/cards";
import { repeat } from "./actions";

export function shuffleLibrary(): PlayerAction {
  return {
    type: "ShuffleZone",
    zone: "library",
  };
}

export function draw(amount: NumberValue): PlayerAction {
  return {
    type: "Draw",
    amount,
  };
}

export function incrementThreat(amount: number): PlayerAction {
  return {
    type: "IncrementThreat",
    amount,
  };
}

export function discard(amount: NumberValue): PlayerAction {
  return {
    type: "Discard",
    amount,
  };
}

export function payResources(
  amount: NumberValue,
  sphere: Sphere | "any"
): PlayerAction {
  return {
    type: "PayResources",
    amount,
    sphere,
  };
}

export function playerChooseCard(params: {
  filter: CardFilter;
  label: string;
  action: CardAction;
  optional: boolean;
}): PlayerAction {
  return {
    type: "ChooseCard",
    multi: false,
    ...params,
  };
}

export function playerChooseCards(params: {
  label: string;
  filter: CardFilter;
  action: CardAction;
  optional: boolean;
}): PlayerAction {
  return {
    type: "ChooseCard",
    multi: true,
    ...params,
  };
}

export function declareAttackers(enemy: CardId): PlayerAction {
  return {
    type: "DeclareAttackers",
    enemy,
  };
}
