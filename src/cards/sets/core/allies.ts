import { keyword } from "../../abilities/keyword";
import { ally } from "../../definitions/ally";

export const veteranAxehand = ally({
  name: "Veteran Axehand",
  cost: 2,
  willpower: 0,
  attack: 2,
  defense: 1,
  hitPoints: 2,
  traits: ["dwarf", "warrior"],
  sphere: "tactics",
  unique: false,
});

export const gondorianSpearman = ally(
  {
    name: "Gondorian Spearman",
    unique: false,
    cost: 2,
    willpower: 0,
    attack: 1,
    defense: 1,
    hitPoints: 1,
    traits: ["gondor", "warrior"],
    sphere: "tactics",
  },
  keyword("sentinel")
  // response({
  //   description:
  //     "Response: After Gondorian Spearman is declared as a defender, deal 1 damage to the attacking enemy.",
  //   event: declaredAsDefender,
  //   condition: (e) => e.defender === self,
  //   action: (e) => dealDamage(1)(e.attacker),
  // })
);

export const beorn = ally(
  {
    name: "Beorn",
    unique: true,
    cost: 6,
    willpower: 1,
    attack: 3,
    defense: 3,
    hitPoints: 6,
    traits: ["beorning", "warrior"],
    sphere: "tactics",
  }
  // action({
  //   description:
  //     "Action: Beorn gains +5 Attack until the end of the phase. At the end of the phase in which you trigger this effect, shuffle Beorn back into your deck. (Limit once per round.)",
  //   effect: all(
  //     modifyCard({
  //       modifier: increment("attack")(5),
  //       until: "end_of_phase",
  //     })(self),
  //     atEndOfPhase(
  //       bindAction(ownerOf(self), (owner) =>
  //         sequence(
  //           move2(self, "library", "back", owner),
  //           update(shuffleZones(and(ofType("library"), ofPlayer(owner))))
  //         )
  //       )
  //     )
  //   ),
  //   limit: oncePerRound(),
  // })
);

export const horsebackArcher = ally(
  {
    name: "Horseback Archer",
    unique: false,
    cost: 3,
    willpower: 0,
    attack: 2,
    defense: 1,
    hitPoints: 2,
    traits: ["rohan", "archer"],
    sphere: "tactics",
  },
  keyword("ranged")
);

export const gandalf = ally(
  {
    name: "Gandalf",
    unique: true,
    cost: 5,
    willpower: 4,
    attack: 4,
    defense: 4,
    hitPoints: 5,
    traits: ["istari"],
    sphere: "neutral",
  }
  // response((r) => r.enteredPlay, {
  //   description:
  //     "Response: After Gandalf enters play, (choose 1): draw 3 cards, deal 4 damage to 1 enemy in play, or reduce your threat by 5.",
  //   condition: (e, self) => e.cardId === self.id,
  //   action: (e) =>
  //     chooseScript("Choose Gandalfs effect", [
  //       {
  //         label: "Draw 3 card",
  //         value: draw(3, e.playerId),
  //       },
  //       {
  //         label: "Deal 4 damage to 1 enemy in play",
  //         value: chooseCardForEffect(
  //           "Choose enemy",
  //           (g) => g.enemies,
  //           (id) => dealDamage(id, 4)
  //         ),
  //       },
  //       {
  //         label: "Reduce your threat by 5",
  //         value: reduceThreat(5, e.playerId),
  //       },
  //     ]),
  // })
);
