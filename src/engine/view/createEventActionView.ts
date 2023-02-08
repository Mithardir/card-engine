import { discardCard, sequence, targetPlayer } from "../../factories/actions";
import { and, canPayCost, cardInHand } from "../../factories/boolValues";
import { EventActionAbility } from "../../types/basic";
import { ActionView, CardView } from "../../types/view";
import { payResources } from "../../factories/playerActions";

export function createEventActionView(
  ability: EventActionAbility,
  card: CardView
): ActionView {
  if (!card.props.sphere || card.owner === "game") {
    return {
      action: "Empty",
      enabled: false,
    };
  }

  const payCost = payResources(
    card.props.cost || 0,
    card.props.sphere === "neutral" ? "any" : card.props.sphere
  );

  return {
    action: sequence(
      targetPlayer(card.owner).to(payCost),
      ability.effect,
      discardCard(card.id)
    ),
    enabled: and(cardInHand(card.id), canPayCost(card.owner, payCost)),
  };
}
