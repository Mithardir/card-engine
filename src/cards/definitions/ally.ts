import { sequence } from "../../engine/actions/global";
import { and } from "../../engine/filters";
import { zoneTypeOf } from "../../engine/getters";
import playerBack from "../../images/back/card.jpg";
import { emptyKeywords } from "../../types/basic";
import { AllyProps } from "../../types/cards";
import { CardDefinition } from "../../types/state";
import { canPayResources } from "../../engine/predicates/canPayResources";
import { isPhase } from "../../engine/predicates/isPhase";
import { ownerOf } from "../../engine/getters/ownerOf";
import { payResources } from "../../engine/actions/player/payResources";
import { playAlly } from "../../engine/actions/card/playAlly";
import { Ability } from "../sets/core/quests";

export function ally(
  props: AllyProps,
  ...abilities: Ability[]
): CardDefinition {
  const image = `https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Core-Set/${props.name
    .split(" ")
    .join("-")}.jpg`;

  return {
    face: {
      ...props,
      image,
      type: "ally",
      keywords: emptyKeywords,
      abilities: [
        {
          description: "Play ally",
          implicit: true,
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
                    payResources([card.props.cost, card.props.sphere]).player(
                      owner
                    ),
                    playAlly().card(card.id)
                  ),
                });
              }
            }
          },
        },
        ...abilities,
      ],
    },
    back: {
      image: playerBack,
      traits: [],
      keywords: emptyKeywords,
    },
    orientation: "portrait",
  };
}
