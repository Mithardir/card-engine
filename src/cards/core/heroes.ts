import { action, modifySelf } from "../../factories/abilities";
import {
  addResources,
  chooseCard,
  choosePlayer,
  dealDamage,
  discard,
  draw,
  exhaust,
  heal,
  modify,
  payCardResources,
  placeProgress,
  targetCard,
  targetPlayer,
} from "../../factories/actions";
import { hero } from "../../factories/cards";
import { keyword } from "../../factories/keyword";
import { response } from "../../factories/responses";
import { and, isQuesting, isEnemy } from "../../factories/boolValues";
import { addWillpower } from "../../factories/modifiers";
import { eachPlayerOncePerRound, oncePerRound } from "../../factories/limits";

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
  modifySelf({
    description: "Gimli gets +1 [attack] for each damage token on him.",
    modifier: (self) => ({
      type: "increment",
      property: "attack",
      amount: { type: "CardNumberValue", card: self, property: "damage" },
    }),
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
  keyword("ranged"),
  response({
    description:
      "After Legolas participates in an attack that destroys an enemy, place 2 progress tokens on the current quest.",
    type: "enemyDestroyed",
    condition: (e, self) => e.attackers.includes(self),
    action: () => placeProgress(2),
  })
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
  response({
    description:
      "While Thalin is committed to a quest, deal 1 damage to each enemy as it is revealed by the encounter deck.",
    type: "cardReveladed",
    condition: (e, self) => and(isQuesting(self), isEnemy(e.card)),
    action: (e) => targetCard(e.card).to(dealDamage(1)),
  })
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
  },
  response({
    description:
      "After Glóin suffers damage, add 1 resource to his resource pool for each point of damage he just suffered.",
    type: "receivedDamage",
    condition: (e, self) => e.card === self,
    action: (e, self) => targetCard(self).to(addResources(e.amount)),
  })
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
  },
  action({
    description:
      "Discard 1 card from your hand to give Éowyn +1 [willpower] until the end of the phase. This effect may be triggered by each player once each round.",
    caster: "any",
    limit: eachPlayerOncePerRound(),
    cost: (caster, self) => targetPlayer(caster).to(discard(1)),
    effect: (caster, self) =>
      targetCard(self).to(
        modify({
          description: "Éowyn's +1 [willpower]",
          modifier: addWillpower(1),
          until: "end_of_phase",
        })
      ),
  })
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
  },
  action({
    description:
      "Exhaust Beravor to choose a player. That player draws 2 cards. Limit once per round.",
    limit: oncePerRound(),
    cost: (caster, self) => targetCard(self).to(exhaust()),
    effect: choosePlayer({
      label: "Choose player to draw 2 cards",
      action: draw(2),
    }),
  })
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
  },
  action({
    description:
      "Pay 1 resource from Glorfindel's pool to heal 1 damage on any character. (Limit once per round.)",
    cost: (caster, self) => targetCard(self).to(payCardResources(1)),
    effect: chooseCard({
      label: "Choose character to heal",
      filter: "isCharacter", // TODO damaged
      action: heal(1),
      optional: false,
    }),
    limit: oncePerRound(),
  })
);
