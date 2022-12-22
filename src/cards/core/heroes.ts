import { modifySelf } from "../../factories/abilities";
import { hero } from "../../factories/cards";

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
  }
  // keyword("ranged"),
  // response((c) => c.enemyDestoryed, {
  //   description:
  //     "After Legolas participates in an attack that destroys an enemy, place 2 progress tokens on the current quest.",
  //   condition: (event, self) => event.attackers.includes(self),
  //   action: () => placeProgress(value(2)),
  // })
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
  }
  // response((s) => s.revealed, {
  //   description:
  //     "While Thalin is committed to a quest, deal 1 damage to each enemy as it is revealed by the encounter deck.",
  //   condition: (event, self, state) =>
  //     state.cards[self].mark.questing &&
  //     toView(state).cards[event.card].props.type === "enemy",
  //   action: (event, self) =>
  //     dealDamage({ damage: value(1), attackers: value([self]) }).card(
  //       event.card
  //     ),
  // })
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