import { AllyProps, Ability, emptyKeywords } from "../../engine/types";
import { CardDefinition, CardId } from "../../engine/state";
import playerBack from "../../Images/back/card.jpg";
import { payResources } from "../../engine/actions/player";
import { moveCard } from "../../engine/actions/card";
import { zoneKey } from "../../engine/utils";
import { bind, pay, sequence } from "../../engine/actions/control";
import {
  countResources,
  Exp,
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

function assign<K extends string, A, B>(
  k: K,
  other: Exp<B>
): (a: Exp<A>) => Exp<A & { [k in K]: B }> {
  return (a) => {
    return {
      print: "x",
      eval: (v) => {
        const result = a.eval(v);
        const merged = other.eval(v);
        return { ...result, [k]: merged } as any;
      },
    };
  };
}

const emptyExp: Exp<{}> = {
  print: "empty",
  eval: () => {
    return {};
  },
};

export function mergeExp2<A, B>(ab: (a: Exp<{}>) => A, bc: (b: A) => B): B {
  return bc(ab(emptyExp));
}

export function mergeExp3<A, B, C>(
  ab: (a: Exp<{}>) => A,
  bc: (b: A) => B,
  cd: (c: B) => C
): C {
  return cd(bc(ab(emptyExp)));
}

export function playAllyAction(cardId: CardId): CardAction {
  const payAction = bind(
    mergeExp3(
      assign("cost", getProp("cost", 0)),
      assign("sphere", getSphere(0)),
      assign("owner", getOwnerOf(0))
    ),
    (v) => (v.owner ? payResources(v.cost, v.sphere)(v.owner) : sequence())
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
