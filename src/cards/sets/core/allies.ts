import { moveCard } from "../../../engine/actions/basic";
import { dealDamage } from "../../../engine/actions/card/dealDamage";
import { cardAction } from "../../../engine/actions/factories";
import {
  chooseAction,
  chooseCardAction,
  sequence,
} from "../../../engine/actions/global";
import {
  draw,
  incrementThreat,
  shuffleLibrary,
} from "../../../engine/actions/player";
import { and, isEnemy, isInPlay, not } from "../../../engine/filters";
import { playerZone, value } from "../../../engine/getters";
import { ownerOf } from "../../../engine/getters/ownerOf";
import {
  Action,
  Effect,
  Getter,
  Predicate,
  Until,
} from "../../../engine/types";
import { CardId, State } from "../../../types/state";
import { keyword } from "../../abilities/keyword";
import { response } from "../../abilities/response";
import { ally } from "../../definitions/ally";
import { Ability } from "./quests";

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

export function setFlag<T>(name: string, value: Getter<T>): Action {
  return {
    print: `setFlag(${name}, ${value.print})`,
    apply: (s) => {
      s.flags[name] = value.get(s);
    },
  };
}

export function isFlagEqual<T>(
  name: string,
  value: Getter<T>
): Predicate<State> {
  return {
    print: `setFlag(${name}, ${value.print})`,
    eval: (state) => state.flags[name] === value.get(state),
  };
}

export function atEndOfRound(action: Action): Action {
  return {
    print: `atEndOfRound(${action.print})`,
    apply: (s) => {
      s.triggers.end_of_round.push(action);
    },
  };
}

export function atEndOfPhase(action: Action): Action {
  return {
    print: `atEndOfPhase(${action.print})`,
    apply: (s) => {
      s.triggers.end_of_phase.push(action);
    },
  };
}

export function addEffect(effect: Effect): Action {
  return {
    print: `addEffect(${effect.description})`,
    apply: (s) => {
      s.effects.push(effect);
    },
  };
}

export function action(props: {
  description: string;
  action: (self: CardId) => Action;
  canRun: Predicate<State>;
}): Ability {
  return {
    description: props.description,
    implicit: false,
    modify: (self, state) => {
      self.actions.push({
        title: props.description,
        action: props.action(self.id),
        canRun: and(isInPlay.card(self.id), props.canRun),
      });
    },
  };
}

export type CardModifier = {
  print: string;
  to: (card: CardId) => Effect;
};

export function increment(
  property: "attack" | "defense" | "willpower" | "hitPoints",
  amount: number,
  until?: Until
): CardModifier {
  return {
    print: `increment(${property}, ${amount}, ${until})`,
    to: (card) => {
      return {
        description: `+${amount} [${property}] to [${card}] ${
          until && "until " + until
        }`,
        apply: (v) => {
          const props = v.cards[card].props;
          if (props[property] !== undefined) {
            props[property]! += amount;
          }
        },
        until,
      };
    },
  };
}

export function cantAttackEngagedPlayer(until?: Until): CardModifier {
  return {
    print: `cantAttackEngagedPlayer(${until})`,
    to: (card) => {
      return {
        description: `[${card}] can't attack engaged player`,
        apply: (v, state) => {
          const owner = ownerOf(card).get(state);
          if (owner) {
            v.cards[card].rules.cantAttackPlayer.push(owner);
          }
        },
        until,
      };
    },
  };
}

export const moveToLibrary = cardAction("moveToLibrary", (c) => {
  const owner = c.get(ownerOf(c.card.id));
  if (owner) {
    return sequence(
      moveCard({
        to: playerZone("library", owner),
        side: "back",
      }).card(c.card.id),
      shuffleLibrary().player(owner)
    );
  }
});

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
          action: draw(3).player(ownerOf(self).get(state)!),
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
          action: incrementThreat(value(-5)).player(ownerOf(self).get(state)!),
        },
      ]),
  })
);
