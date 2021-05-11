import { EventProps, Ability, emptyKeywords } from "../../engine/types";
import { CardDefinition } from "../../engine/state";
import playerBack from "../../Images/back/card.jpg";
import { moveCard } from "../../engine/actions/card";
import { pay, sequence } from "../../engine/actions/control";
import { Action } from "../../engine/actions/types";
import { zoneKey } from "../../engine/utils";
import { draw, payResources } from "../../engine/actions/player";

export function action(props: { description: string; effect: Action }): Ability {
  // TODO pay
  return {
    description: props.description,
    activate: (view, self) => {
      const card = view.cards.find((c) => c.id === self);
      const owner = view.players.find((p) => p.zones.hand.cards.includes(self));
      if (card && owner && card.props.cost && card.props.sphere) {
        card.actions.push({
          description: props.description,
          effect: pay(
            payResources(card.props.cost, card.props.sphere)(owner.id),
            sequence(props.effect, moveCard(zoneKey("hand", owner.id), zoneKey("discardPile", owner.id), "face")(self))
          ),
        });
      }
    },
  };
}

export function event(props: EventProps, ...abilities: Ability[]): CardDefinition {
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
