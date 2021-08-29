import { AllyProps, Ability, emptyKeywords } from "../../engine/types";
import { CardDefinition, CardId } from "../../engine/state";
import playerBack from "../../Images/back/card.jpg";
import { payResources } from "../../engine/actions/player";
import { moveCard } from "../../engine/actions/card";
import { zoneKey } from "../../engine/utils";
import { bind, pay, sequence } from "../../engine/actions/control";
import {
  countResources,
  getOwnerOf,
  getProp,
  getSphere,
} from "../../engine/exps";
import { CardAction } from "../../engine/actions/types";
import { addAction, modifyCard } from "../../engine/actions/modifiers";
import { getCard } from "../../engine/actions/utils";

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
      abilities: [...abilities, playAllyAbility],
    },
    back: {
      image: playerBack,
      abilities: [],
      traits: [],
      keywords: emptyKeywords,
    },
    orientation: "portrait",
  };
}

export const playAllyAbility: Ability = {
  description: "Play ally",
  implicit: true,
  modifier: (self) => modifyCard(self, addAction(playAllyAction(self))),
};

export function playAllyAction(cardId: CardId): CardAction {
  const payAction = bind(getProp("cost", cardId), (cost) =>
    bind(getSphere(cardId), (sphere) =>
      bind(getOwnerOf(cardId), (owner) =>
        owner ? payResources(cost, sphere)(owner) : sequence()
      )
    )
  );

  const moveAction = bind(getOwnerOf(cardId), (owner) =>
    owner
      ? moveCard(
          zoneKey("hand", owner),
          zoneKey("playerArea", owner),
          "face"
        )(cardId)
      : sequence()
  );

  return {
    description: "Play ally",
    condition: {
      print: "Can play ally",
      eval: (view) => {
        const owner = getOwnerOf(cardId).eval(view);
        const card = getCard(cardId, view);
        if (
          owner &&
          card?.props.type === "ally" &&
          card.props.cost &&
          card.props.sphere
        ) {
          const canPay =
            countResources(card.props.sphere, owner).eval(view) >=
            card.props.cost;
          return canPay;
        }

        return false;
      },
    },
    effect: pay(payAction, moveAction),
  };
}
