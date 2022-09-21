import { values, range, last } from "lodash";
import { Phase, Mark, Side } from "../../types/basic";
import {
  PlayerId,
  CardView,
  ZoneState,
  CardId,
  CardState,
} from "../../types/state";
import { shuffleArray } from "../../utils";
import { toView } from "../engine";
import {
  filterCards,
  and,
  isLocation,
  isInZone,
  isReady,
  isCharacter,
  isHero,
} from "../filters";
import {
  topCard,
  gameZone,
  minus,
  totalWillpower,
  totalThread,
  isMore,
  value,
  playerZone,
  getProp,
  attackers,
  defenders,
  totalAttack,
  totalDefense,
} from "../getters";
import { Action, Getter, PlayerAction, Predicate, CardAction } from "../types";
import { flip, mark, moveCard, tap, travelTo } from "./basic";
import { resolveDefense, cardActionSequence, asCardAction } from "./card";
import { dealDamage } from "./card/dealDamage";
import { ActionResult } from "./factories";
import { incrementThreat } from "./player";
import { resolveResponses } from "./resolveResponses";

export function playerActions(nextTitle: string): Action {
  return {
    print: `playerActions("${nextTitle}")`,
    apply: (state) => {
      const view = toView(state);
      state.choice = {
        title: nextTitle,
        dialog: false,
        multi: false,
        options: values(view.cards).flatMap((c) =>
          c.actions
            .filter((a) => a.canRun.eval(state, state))
            .map((a) => ({
              title: a.title,
              action: sequence(a.action, playerActions(nextTitle)),
              cardId: c.id,
            }))
        ),
      };
    },
  };
}

export function sequence(...actions: Action[]): Action {
  return {
    print: `sequence(${actions.map((a) => a.print).join(", ")})`,
    apply: (state) => {
      state.next = [...actions, ...state.next];
    },
  };
}

export function whileDo(exp: Getter<boolean>, action: Action): Action {
  return {
    print: `whileDo(${exp.print}, ${action.print})`,
    apply: (state) => {
      const result = exp.get(state);
      if (result) {
        state.next = [action, whileDo(exp, action), ...state.next];
      }
    },
  };
}

export function chooseAction(
  title: string,
  options: Array<{ title: string; action: Action }>
): Action {
  return {
    print: `choose: ${options.map((o) => o.title)}`,
    apply: (s) => {
      s.choice = {
        title,
        options: options.filter(
          (o) => !o.action.result || o.action.result(s) !== "none"
        ),
        dialog: true,
        multi: false,
      };
    },
  };
}

export function beginPhase(type: Phase): Action {
  return {
    print: `beginPhase(${type})`,
    apply: (s) => {
      s.phase = type;
    },
  };
}

export function eachPlayer(playerAction: PlayerAction): Action {
  return {
    print: `eachPlayer(${playerAction.print})`,
    apply: (s) => {
      const action = sequence(
        ...Object.keys(s.players).map((p) => playerAction.player(p as any))
      );
      return action.apply(s);
    },
  };
}

export function eachCard(
  filter: Predicate<CardView>,
  cardAction: CardAction
): Action {
  return {
    print: `cardAction(${cardAction.print})`,
    apply: (s) => {
      const cards = filterCards(filter).get(s);
      if (cards) {
        const action = sequence(...cards.map((p) => cardAction.card(p.id)));
        return action.apply(s);
      }
    },
  };
}

export function chooseCardAction(
  title: string,
  filter: Predicate<CardView>,
  factory: CardAction,
  allowSkip: boolean
): Action {
  return {
    print: `chooseCardAction("${title}", ${filter.print}, ${factory.print})`,
    apply: (state) => {
      const cards = filterCards(filter).get(state);
      if (cards) {
        const options = cards
          .map((card) => ({
            title: card.props.name || "",
            action: factory.card(card.id),
            image: card.props.image,
          }))
          .filter((o) => !o.action.result || o.action.result(state) !== "none");

        state.choice = {
          title,
          dialog: true,
          multi: false,
          options: allowSkip
            ? [...options, { title: "Skip", action: sequence() }]
            : options,
        };
      }
    },
    result: (state) => {
      const cards = filterCards(filter).get(state);
      if (!cards || cards.length === 0) {
        return "none";
      }

      const actions = cards.map((c) => factory.card(c.id));
      return mergeOrResults(
        ...actions.map((a) => (a.result ? a.result(state) : "full"))
      );
    },
  };
}

export function mergeOrResults(...results: ActionResult[]): ActionResult {
  if (results.some((r) => r === "full")) {
    return "full";
  }

  if (results.every((r) => r === "none")) {
    return "none";
  }

  return "partial";
}

export function chooseCardsActions(
  title: string,
  filter: Predicate<CardView>,
  factory: CardAction
): Action {
  return {
    print: `chooseCardsActions("${title}", ${filter.print}, ${factory.print})`,
    apply: (state) => {
      const cards = filterCards(filter).get(state);
      if (cards) {
        const options = cards.map((card) => ({
          title: card.props.name || "",
          action: factory.card(card.id),
          image: card.props.image,
        }));

        state.choice = {
          title,
          dialog: true,
          multi: true,
          options,
        };
      }
    },
  };
}

export function clearMarks(type: Mark): Action {
  return {
    print: `clearMarks(${type})`,
    apply: (s) => {
      for (const card of values(s.cards)) {
        card.mark[type] = false;
      }
    },
  };
}

export function repeat(expr: Getter<number>, action: Action): Action {
  return {
    print: `repeat(${expr.print}, ${action.print})`,
    apply: (s) => {
      const amount = expr.get(s);
      sequence(...range(0, amount).map(() => action)).apply(s);
    },
  };
}

export function moveTopCard(
  from: Getter<ZoneState>,
  to: Getter<ZoneState>,
  side: Side
): Action {
  return {
    print: `moveTopCard(${from.print}, ${to.print}, ${side})`,
    apply: (state) => {
      const fromZone = from.get(state);
      const toZone = to.get(state);
      if (fromZone && toZone && fromZone.cards.length > 0) {
        const cardId = fromZone.cards.pop()!;
        const card = state.cards[cardId];
        card.sideUp = side;
        toZone.cards.push(cardId);
      }
    },
  };
}

export const revealEncounterCard = sequence(
  flip("face").card(topCard(gameZone("encounterDeck"))),
  resolveResponses(
    "Choose response for revealing card",
    (r) => r.revealed,
    (s) => ({
      card: topCard(gameZone("encounterDeck")).get(s)!,
    })
  ),
  moveTopCard(gameZone("encounterDeck"), gameZone("stagingArea"), "face")
);

export function ifThenElse(
  condition: Getter<boolean>,
  ifTrue: Action,
  ifFalse: Action
): Action {
  return {
    print: `if(${condition.print}) {${ifTrue.print}} else {${ifFalse.print}}`,
    apply: (s) => {
      const result = condition.get(s);
      if (result) {
        ifTrue.apply(s);
      } else {
        ifFalse.apply(s);
      }
    },
  };
}

export function placeProgress(amount: Getter<number>): Action {
  // TODO to active location
  return {
    print: `placeProgress(${amount.print})`,
    apply: (s) => {
      const cardId = last(s.zones.questDeck.cards);
      if (cardId) {
        const card = s.cards[cardId];
        const inc = amount.get(s);
        if (card && inc) {
          card.token.progress += inc;
        }
      }
    },
  };
}

export function resolveQuest(): Action {
  const power = minus(totalWillpower, totalThread);
  return ifThenElse(
    isMore(power, value(0)),
    placeProgress(power),
    eachPlayer(incrementThreat(minus(value(0), power)))
  );
}

export const chooseTravelLocation = chooseCardAction(
  "Choose location for travel",
  and(isLocation, isInZone(gameZone("stagingArea"))),
  travelTo,
  true
);

export function chooseOne(
  title: string,
  choices: Array<{ title: string; image?: string; action: Action }>
): Action {
  return {
    print: `chooseOne(${choices.map((c) => c.action.print).join(", ")})`,
    apply: (state) => {
      state.choice = {
        title,
        dialog: true,
        multi: false,
        options: choices,
      };
    },
  };
}

export function declareDefender(attacker: CardId, player: PlayerId): Action {
  return {
    print: `declareDefender(${attacker}, ${player})`,
    apply: (state) => {
      chooseCardAction(
        "Declare defender",
        and(isReady, isCharacter, isInZone(playerZone("playerArea", player))),
        cardActionSequence([
          tap(),
          mark("defending"),
          asCardAction((defender) =>
            resolveResponses(
              "Choose response for declaring defender",
              (s) => s.declaredDefender,
              () => ({ attacker, defender: defender })
            )
          ),
        ]),
        true
      ).apply(state);
    },
  };
}

export function declareAttackers(enemy: CardId, player: PlayerId): Action {
  return {
    print: `declareAttackers(${enemy}, ${player})`,
    apply: (state) => {
      chooseCardsActions(
        "Declare attackers",
        and(isReady, isCharacter, isInZone(playerZone("playerArea", player))),
        cardActionSequence([mark("attacking"), tap()])
      ).apply(state);
    },
  };
}

export function addToStagingArea(name: string): Action {
  return {
    print: `addToStagingArea(${name})`,
    apply: (s) => {
      const card = values(s.cards).find((c) => c.definition.face.name === name);
      if (card) {
        moveCard({
          from: gameZone("encounterDeck"),
          to: gameZone("stagingArea"),
          side: "face",
        })
          .card(card.id)
          .apply(s);
      }
    },
  };
}

export const setupActions: Action = {
  print: "setupActions",
  apply: (s) => {
    const view = toView(s);
    const setups = values(view.cards).flatMap((c) => c.setup);
    sequence(...setups).apply(s);
  },
};

export function flipCard(card: Getter<CardState>, side: Side): Action {
  return {
    print: `flipCard(${card.print}, ${side})`,
    apply: (s) => {
      const c = card.get(s);
      if (c) {
        c.sideUp = side;
      }
    },
  };
}

export function shuffleZone(getter: Getter<ZoneState>): Action {
  return {
    print: `shuffleZone(${getter.print})`,
    apply: (s) => {
      const cards = getter.get(s)?.cards;
      if (cards && cards.length >= 1) {
        shuffleArray(cards);
      }
    },
  };
}
