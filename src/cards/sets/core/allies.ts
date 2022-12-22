import { dealDamage } from "../../../engine/actions/card/dealDamage";
import {
  chooseAction,
  chooseCardAction,
  sequence,
} from "../../../engine/actions/global";
import { draw, incrementThreat } from "../../../engine/actions/player";
import { isEnemy, not } from "../../../engine/filters";
import { value } from "../../../engine/getters";
import { controllerOf } from "../../../engine/getters/controllerOf";
import { keyword } from "../../abilities/keyword";
import { response } from "../../abilities/response";
import { action, ally } from "../../definitions/ally";
import { addEffect } from "../../../engine/actions/addEffect";
import { atEndOfRound } from "../../../engine/actions/atEndOfRound";
import { increment } from "../../../engine/modifiers/increment";
import { isFlagEqual } from "../../../engine/predicates/isFlagEqual";
import { moveToLibrary } from "../../../engine/actions/card/moveToLibrary";
import { setFlag } from "../../../engine/actions/setFlag";
import { atEndOfPhase } from "../../../engine/actions/atEndOfPhase";

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
  keyword("sentinel"),
  response((s) => s.declaredDefender, {
    description:
      "Response: After Gondorian Spearman is declared as a defender, deal 1 damage to the attacking enemy.",
    condition: (event, self) => event.defender === self,
    action: (event, self) =>
      dealDamage({ damage: value(1), attackers: value([self]) }).card(
        event.attacker
      ),
  })
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
  },
  action({
    description:
      "Action: Beorn gains +5 Attack until the end of the phase. At the end of the phase in which you trigger this effect, shuffle Beorn back into your deck. (Limit once per round.)",
    canRun: not(isFlagEqual("beorn_ability_used", value(true))),
    action: (self) =>
      sequence(
        addEffect(increment("attack", 5, "end_of_phase").to(self)),
        setFlag("beorn_ability_used", value(true)),
        atEndOfPhase(moveToLibrary().card(self)),
        atEndOfRound(setFlag("beorn_ability_used", value(false)))
      ),
  })
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
  },
  response((s) => s.enteredPlay, {
    description:
      "Response: After Gandalf enters play, (choose 1): draw 3 cards, deal 4 damage to 1 enemy in play, or reduce your threat by 5.",
    condition: (event, self) => event.card === self,
    action: (event, self, state) =>
      chooseAction("Choose Gandalfs effect", [
        {
          title: "Draw 3 card",
          action: draw(3).player(controllerOf(self).get(state)!),
        },
        {
          title: "Deal 4 damage to 1 enemy in play",
          action: chooseCardAction(
            "Choose enemy",
            isEnemy,
            dealDamage({ damage: value(4), attackers: value([self]) }),
            false
          ),
        },
        {
          title: "Reduce your threat by 5",
          action: incrementThreat(value(-5)).player(
            controllerOf(self).get(state)!
          ),
        },
      ]),
  })
);
