import { Ability } from "../../types/basic";
import { CardView } from "../../types/view";
import { createEventActionView } from "../view/createEventActionView";

export function executeAbility(ability: Ability, card: CardView): void {
  switch (ability.type) {
    case "Keyword":
    case "ModifySelf":
    case "Response":
      return;
    case "EventAction":
      card.actions.push(createEventActionView(ability, card));
      return;
    default:
      return;
  }
}
