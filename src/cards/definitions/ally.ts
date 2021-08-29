import { AllyProps, Ability, emptyKeywords } from "../../engine/types";
import { CardDefinition } from "../../engine/state";
import playerBack from "../../Images/back/card.jpg";
import { payResources } from "../../engine/actions/player";
import { moveCard } from "../../engine/actions/card";
import { zoneKey } from "../../engine/utils";
import { pay } from "../../engine/actions/control";
import { countResources } from "../../engine/exps";
import { values } from "lodash";

export const playAlly: Ability = {
  description: "Play ally",
  implicit: true,
  modifier: (cardId) => {
    return {
      print: "Play ally",
      modify: (view) => {
        const owner = values(view.players).find((p) =>
          p.zones.hand.cards.includes(cardId)
        );
        const card = view.cards.find((c) => c.id === cardId);
        if (
          owner &&
          card?.props.type === "ally" &&
          card.props.cost &&
          card.props.sphere
        ) {
          const canPay =
            countResources(card.props.sphere, owner.id).eval(view) >=
            card.props.cost;
          if (canPay) {
            const payAction = payResources(
              card.props.cost,
              card.props.sphere
            )(owner.id);
            const moveAction = moveCard(
              zoneKey("hand", owner.id),
              zoneKey("playerArea", owner.id),
              "face"
            )(cardId);
            card.actions.push({
              description: "Play ally",
              effect: pay(payAction, moveAction),
            });
          }
        }
      },
    };
  },
};

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
      abilities: [...abilities, playAlly],
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
