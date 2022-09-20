import { CardView } from "../../types/state";
import { ownerOf } from "../../engine/getters/ownerOf";
import { zoneTypeOf } from "../../engine/getters";
import { chooseCardAction, sequence } from "../../engine/actions/global";
import { payResources } from "../../engine/actions/player/payResources";
import { canPayResources } from "../../engine/predicates/canPayResources";
import { isPhase } from "../../engine/predicates/isPhase";
import { and, isInPlay } from "../../engine/filters";
import { Predicate } from "../../engine/types";
import { Ability } from "../sets/core/quests";
import { attach } from "../../engine/actions/card/attach";

export function attaches(params: {
  description: string;
  filter: Predicate<CardView>;
}): Ability {
  return {
    description: params.description,
    implicit: false,
    modify: (card, s) => {
      const owner = ownerOf(card.id).get(s);
      if (owner && card.props.cost && card.props.sphere) {
        const zone = zoneTypeOf(card.id).get(s);
        if (zone === "hand") {
          card.actions.push({
            title: `Play ${card.props.name}`,
            canRun: and(
              isPhase("planning"),
              canPayResources(owner, card.props.cost, card.props.sphere)
            ),
            action: sequence(
              payResources([card.props.cost, card.props.sphere]).player(owner),
              chooseCardAction(
                "Select target for attachment",
                and(isInPlay, params.filter),
                attach(card.id),
                false
              )
            ),
          });
        }
      }
    },
  };
}
