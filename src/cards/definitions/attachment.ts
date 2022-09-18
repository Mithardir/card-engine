import playerBack from "../../images/back/card.jpg";
import { CardDefinition, CardId, CardView } from "../../types/state";
import { emptyKeywords } from "../../types/basic";
import { AttachmentProps } from "../../types/cards";
import { ownerOf } from "../../engine/getters/ownerOf";
import { zoneOf, zoneTypeOf } from "../../engine/getters";
import { playAlly } from "../../engine/actions/card/playAlly";
import { chooseCardAction, sequence } from "../../engine/actions/global";
import { payResources } from "../../engine/actions/player/payResources";
import { canPayResources } from "../../engine/predicates/canPayResources";
import { isPhase } from "../../engine/predicates/isPhase";
import { and, isInPlay } from "../../engine/filters";
import { Predicate } from "../../engine/types";
import { Ability } from "../sets/core/quests";
import { cardAction } from "../../engine/actions/factories";
import { moveCard } from "../../engine/actions/basic";

export const attach = cardAction<CardId>("attachTo", (c, attachment) => {
  c.card.attachments.push(attachment);
  c.run(moveCard({ to: zoneOf(c.card.id), side: "face" }).card(attachment));
});

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

export function attachment(
  props: AttachmentProps,
  ...abilities: Ability[]
): CardDefinition {
  const image = `https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Core-Set/${props.name
    .split(" ")
    .join("-")}.jpg`;

  return {
    face: {
      ...props,
      image,
      type: "attachment",
      keywords: emptyKeywords,
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
