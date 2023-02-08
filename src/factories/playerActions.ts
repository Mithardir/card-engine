import { PlayerAction, CardAction } from "../types/actions";
import { PlayerId, NumberValue, CardFilter } from "../types/basic";
import { Sphere } from "../types/cards";

export const commitCharactersToQuest: (id: PlayerId) => PlayerAction = (
  player: PlayerId
) => {
  return playerChooseCards({
    action: "CommitToQuest",
    label: "Choose characters commiting to quest",
    filter: { type: "HasController", player: player },
  });
};

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
  throw new Error("not implemented");
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
}): PlayerAction {
  return {
    type: "ChooseCard",
    multi: false,
    ...params,
  };
}

export function playerChooseCards(params: {
  filter: CardFilter;
  label: string;
  action: CardAction;
}): PlayerAction {
  return {
    type: "ChooseCard",
    multi: true,
    ...params,
  };
}
