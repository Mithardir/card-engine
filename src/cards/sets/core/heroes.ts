import { dealDamage } from "../../../engine/actions/card";
import { placeProgress } from "../../../engine/actions/game";
import {
  addKeyword,
  addResponse,
  bindCM,
  CardModifier,
  increment,
  modifyCard,
} from "../../../engine/actions/modifiers";
import { Exp, getTokens, mapExp } from "../../../engine/exps";
import { CardId } from "../../../engine/state";
import { Ability } from "../../../engine/types";
import { hero } from "../../definitions/hero";

function selfModifier(props: {
  description: string;
  modifier: (self: CardId) => CardModifier;
  modifier2: (self: CardId) => Exp<CardModifier>;
}): Ability {
  return {
    description: props.description,
    implicit: false,
    modifier: (self) => modifyCard(self, props.modifier(self)),
  };
}

export const gimli = hero(
  {
    name: "Gimli",
    threatCost: 11,
    willpower: 2,
    attack: 2,
    defense: 2,
    hitPoints: 5,
    traits: ["dwarf", "noble", "warrior"],
    sphere: "tactics",
  },
  selfModifier({
    description: "Gimli gets +1 [attack] for each damage token on him.",
    modifier: (self) =>
      bindCM(getTokens("damage", self), (damage) =>
        increment("attack", damage)
      ),
    modifier2: (self) =>
      mapExp(getTokens("damage", self), (damage) =>
        increment("attack", damage)
      ),
  })
);

export const legolas = hero(
  {
    name: "Legolas",
    threatCost: 9,
    willpower: 1,
    attack: 3,
    defense: 1,
    hitPoints: 4,
    traits: ["noble", "silvan", "warrior"],
    sphere: "tactics",
  },
  {
    description: "Ranged",
    implicit: true,
    modifier: (self) => modifyCard(self, addKeyword("ranged")),
  },
  {
    description:
      "After Legolas participates in an attack that destroys an enemy, place 2 progress tokens on the current quest.",
    implicit: false,
    modifier: (self) =>
      addResponse((r) => r.destroyed, {
        description:
          "After Legolas participates in an attack that destroys an enemy, place 2 progress tokens on the current quest.",
        condition: (e, v) =>
          e.attackers.includes(self) &&
          v.cards.some((c) => c.id === e.cardId && c.props.type === "enemy"),
        action: () => placeProgress(2),
      }),
  }
);

export const thalin = hero(
  {
    name: "Thalin",
    threatCost: 9,
    willpower: 1,
    attack: 2,
    defense: 2,
    hitPoints: 4,
    traits: ["dwarf", "warrior"],
    sphere: "tactics",
  },
  {
    description:
      "While Thalin is committed to a quest, deal 1 damage to each enemy as it is revealed by the encounter deck.",
    implicit: false,
    modifier: (self) =>
      addResponse((r) => r.revealed, {
        description:
          "While Thalin is committed to a quest, deal 1 damage to each enemy as it is revealed by the encounter deck.",
        condition: (e, v) => {
          const quest = v.phase === "quest";
          const commited = v.cards.find((c) => c.id === self)!.mark.questing;
          const enemy =
            v.cards.find((c) => c.id === e.cardId)!.props.type === "enemy";
          return quest && commited && enemy;
        },
        action: (e) => dealDamage(1, [])(e.cardId),
      }),
  }
);

export const gloin = hero(
  {
    name: "Glóin",
    threatCost: 9,
    willpower: 2,
    attack: 2,
    defense: 1,
    hitPoints: 4,
    traits: ["dwarf", "noble"],
    sphere: "leadership",
  }
  // response({
  //   description:
  //     "After Glóin suffers damage, add 1 resource to his resource pool for each point of damage he just suffered.",
  //   event: receivedDamage(),
  //   condition: (e) => e.cardId === self,
  //   action: (e) => addResources(e.amount)(self),
  // })
);

export const eowyn = hero(
  {
    name: "Éowyn",
    threatCost: 9,
    willpower: 4,
    attack: 1,
    defense: 1,
    hitPoints: 3,
    traits: ["noble", "rohan"],
    sphere: "spirit",
  }
  //   action({
  //     description:
  //       "Discard 1 card from your hand to give Éowyn +1 [willpower] until the end of the phase. This effect may be triggered by each player once each round.",
  //     caster: all,
  //     cost: discard(1),
  //     limit: eachPlayerOncePerRound,
  //     effect: modifySelf({
  //       description: "Éowyn's +1 [willpower]",
  //       modifier: addWillpower,
  //       params: [1],
  //       until: "end_of_phase"
  //     })
  //   })
);

export const beravor = hero(
  {
    name: "Beravor",
    threatCost: 10,
    willpower: 2,
    attack: 2,
    defense: 2,
    hitPoints: 4,
    traits: ["dúnedain", "ranger"],
    sphere: "lore",
  }
  //   action({
  //     description: "Exhaust Beravor to choose a player. That player draws 2 cards. Limit once per round.",
  //     cost: exhaust,
  //     effect: choosePlayerTo(draw(2), "Choose player to draw 2 cards"),
  //     limit: oncePerRound
  //   })
);

export const glorfindel = hero(
  {
    name: "Glorfindel",
    threatCost: 12,
    willpower: 3,
    attack: 3,
    defense: 1,
    hitPoints: 5,
    traits: ["noble", "noldor", "warrior"],
    sphere: "lore",
  }
  // action({
  //   description: "Pay 1 resource from Glorfindel's pool to heal 1 damage on any character. (Limit once per round.)",
  //   cost: payCardResources(1)(self),
  //   effect: chooseCardFor(isCharacter, heal(1)),
  //   limit: oncePerRound(),
  // })
);
