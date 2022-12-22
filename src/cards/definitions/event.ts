import playerBack from "../../images/back/card.jpg";
import { CardDefinition } from "../../types/state";
import { emptyKeywords } from "../../types/basic";
import { EventProps } from "../../types/cards";
import { Ability } from "../abilities/Ability";
import { Action } from "../../engine/types";
import { controllerOf } from "../../engine/getters/controllerOf";
import { playerZone, zoneTypeOf } from "../../engine/getters";
import { and } from "../../engine/filters";
import {
  canDoPartiallyAction,
  canPayResources,
} from "../../engine/predicates/canPayResources";
import { sequence } from "../../engine/actions/global";
import { payResources } from "../../engine/actions/player/payResources";
import { moveCard } from "../../engine/actions/basic";

export function action(params: {
  description: string;
  effect: Action;
}): Ability {
  return {
    description: params.description,
    implicit: false,
    modify: (card, s) => {
      const controller = controllerOf(card.id).get(s);
      if (controller && card.props.cost && card.props.sphere) {
        const zone = zoneTypeOf(card.id).get(s);
        if (zone === "hand") {
          card.actions.push({
            title: `Play ${card.props.name}`,
            canRun: and(
              canPayResources(controller, card.props.cost, card.props.sphere),
              canDoPartiallyAction(params.effect)
            ),
            action: sequence(
              payResources([card.props.cost, card.props.sphere]).player(
                controller
              ),
              params.effect,
              moveCard({
                to: playerZone("discardPile", controller),
                side: "face",
              }).card(card.id)
            ),
          });
        }
      }
    },
  };
}

export function event(
  props: EventProps,
  ...abilities: Ability[]
): CardDefinition {
  const image = `https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Core-Set/${props.name
    .split(" ")
    .join("-")}.jpg`;

  return {
    face: {
      ...props,
      image,
      type: "event",
      keywords: emptyKeywords,
      traits: [],
      abilities,
    },
    back: {
      image: playerBack,
      traits: [],
      keywords: emptyKeywords,
    },
    orientation: "portrait",
  };
}
