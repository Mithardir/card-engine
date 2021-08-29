import { EventProps, Ability, emptyKeywords } from "../../engine/types";
import { CardDefinition } from "../../engine/state";
import playerBack from "../../Images/back/card.jpg";
import { moveCard } from "../../engine/actions/card";
import { pay, sequence } from "../../engine/actions/control";
import { Action } from "../../engine/actions/types";
import { zoneKey } from "../../engine/utils";
import { draw, payResources } from "../../engine/actions/player";
import { countResources } from "../../engine/exps";
import { values } from "lodash";

export function action(props: {
  description: string;
  effect: Action;
}): Ability {
  return {
    description: props.description,
    implicit: false,
    activate: (view, self) => {
      return {
        print: "X",
        modify: (view) => {
          const card = view.cards.find((c) => c.id === self);
          const owner = values(view.players).find((p) =>
            p.zones.hand.cards.includes(self)
          );
          if (card && owner && card.props.cost && card.props.sphere) {
            const canPay =
              countResources(card.props.sphere, owner.id).eval(view) >=
              card.props.cost;
            if (canPay) {
              card.actions.push({
                description: props.description,
                effect: pay(
                  payResources(card.props.cost, card.props.sphere)(owner.id),
                  sequence(
                    props.effect,
                    moveCard(
                      zoneKey("hand", owner.id),
                      zoneKey("discardPile", owner.id),
                      "face"
                    )(self)
                  )
                ),
              });
            }
          }
        },
      };
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
      abilities: [
        action({
          description: "test",
          effect: draw(1)("A"),
        }),
      ],
      traits: [],
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
