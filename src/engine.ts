import { CardProps } from "@mui/material";
import { keys, last, mapValues, range, reverse, values } from "lodash";
import { Scenario, PlayerDeck } from "./setup";
import {
  AbilityView,
  GameZoneType,
  Phase,
  playerIds,
  PlayerZoneType,
  PrintedProps,
} from "./types";

export type PlayerState = {
  id: PlayerId;
  zones: Record<PlayerZoneType, ZoneState>;
  thread: number;
};

export interface ZoneState {
  stack: boolean;
  cards: CardId[];
}

export interface Flavoring<FlavorT> {
  _type?: FlavorT;
}

export type Flavor<T, FlavorT> = T & Flavoring<FlavorT>;

export type CardId = Flavor<number, "Card">;

export type Side = "face" | "back";

export type Token = "damage" | "progress" | "resources";

export type Mark = "questing" | "attacking" | "defending" | "attacked";

export type Tokens = Record<Token, number>;

export type Marks = Record<Mark, boolean>;

export type CardDefinition = {
  face: PrintedProps;
  back: PrintedProps;
  orientation: "landscape" | "portrait";
};

export type CardState = {
  id: CardId;
  definition: CardDefinition;
  sideUp: Side;
  tapped: boolean;
  token: Tokens;
  mark: Marks;
  attachedTo?: CardId | undefined;
};

export type State = {
  phase: Phase;
  players: Partial<Record<PlayerId, PlayerState>>;
  zones: Record<GameZoneType, ZoneState>;
  cards: Record<CardId, CardState>;
  effects: Effect[];
  choice?: {
    title: string;
    dialog: boolean;
    multi: boolean;
    options: Array<{ title: string; action: Action }>;
  };
  next: Action[];
  responses: {};
};

export type Response<T> = {
  description: string;
  create: (e: T) => Action;
};

export function incAResponse(
  description: string,
  create: (e: IncAEvent) => Action
): Response<IncAEvent> {
  return {
    description,
    create,
  };
}

export type CardView = {
  id: CardId;
  props: PrintedProps;
  abilities: AbilityView[];
  setup: Action[];
};

export type View = {
  cards: Record<CardId, CardView>;
};

export type Effect = {
  description: string;
  apply: (view: View) => View;
};

export type Action = {
  print: string;
  apply: (state: State) => void;
};

export type Getter<T> = {
  print: string;
  get: (state: State) => T | undefined;
};

export type IncAEvent = {
  type: "incA";
  amount: number;
};

export type IncBEvent = {
  type: "incB";
  amount: number;
};

export function createCardView(state: CardState): CardView {
  const printed = state.definition[state.sideUp];
  return {
    id: state.id,
    props: printed,
    setup: [],
    abilities: printed.abilities?.map((a) => ({ ...a, applied: false })) || [],
  };
}

export function toView(state: State): View {
  const view: View = {
    cards: mapValues(state.cards, (c) => createCardView(c)),
  };

  while (true) {
    let allApplied = true;
    values(view.cards).forEach((card) => {
      card.abilities
        .filter((a) => !a.applied)
        .forEach((ability) => {
          allApplied = false;
          const modifier = ability.modifier(card.id);
          modifier.modify(view);
          ability.applied = true;
        });
    });

    if (allApplied) {
      break;
    }
  }

  return view;
}

export function playerActions(nextTitle: string): Action {
  return {
    print: `playerActions("${nextTitle}")`,
    apply: (state) => {
      state.choice = {
        title: nextTitle,
        dialog: false,
        multi: false,
        options: [],
      };
    },
  };
}

export function value<T extends { toString: () => string }>(v: T): Getter<T> {
  return {
    print: v.toString(),
    get: () => v,
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
      s.choice = { title, options, dialog: true, multi: false };
    },
  };
}

export function nextStep(state: State): void {
  const action = state.next.shift();
  if (action) {
    action.apply(state);
  }
}

export function beginPhase(type: Phase): Action {
  return {
    print: `beginPhase(${type})`,
    apply: (s) => {
      s.phase = type;
    },
  };
}

export type PlayerAction = {
  print: string;
  action: (playerId: PlayerId) => Action;
};

export function draw(amount: number): PlayerAction {
  return {
    print: `draw(${amount})`,
    action: (id) => playerDraw(id, amount),
  };
}

export function incrementThreat(
  amount: Getter<number>,
  playerId?: PlayerId
): PlayerAction & Action {
  return {
    print: `incrementThreat(${amount.print}, ${playerId})`,
    action: (id) => incrementThreat(amount, id),
    apply: (s) => {
      if (playerId) {
        const player = s.players[playerId];
        const inc = amount.get(s);
        if (player && inc) {
          player.thread += inc;
        }
      }
    },
  };
}

export type PlayerId = "A" | "B" | "C" | "D";

export function playerDraw(playerId: PlayerId, amount: number): Action {
  return {
    print: `playerDraw(${playerId}, ${amount})`,
    apply: (s) => {
      const player = s.players[playerId];
      if (player) {
        for (let index = 0; index < amount; index++) {
          const cardId = player.zones.library.cards.pop();
          if (cardId) {
            player.zones.hand.cards.push(cardId);
            const card = s.cards[cardId];
            if (card) {
              card.sideUp = "face";
            }
          }
        }
      }
    },
  };
}

export function eachPlayer(playerAction: PlayerAction): Action {
  return {
    print: `eachPlayer(${playerAction.print})`,
    apply: (s) => {
      const action = sequence(
        ...Object.keys(s.players).map((p) => playerAction.action(p as any))
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
        const action = sequence(...cards.map((p) => cardAction.action(p.id)));
        return action.apply(s);
      }
    },
  };
}

export const isHero: Predicate<CardView> = {
  print: "isHero",
  eval: (card) => card.props.type === "hero",
};

export const phaseResource = sequence(
  beginPhase("resource"),
  eachPlayer(draw(1)),
  eachCard(isHero, generateResource(1)),
  playerActions("End resource phase")
);

export const phasePlanning = sequence(
  beginPhase("planning"),
  playerActions("End planning phase")
);

export type CardFilter = { print: string };

export type CardAction = {
  print: string;
  action: (cardId: CardId) => Action;
};

export type Predicate<T> = {
  print: string;
  eval: (item: T, state: State) => boolean;
};

export function filterCards(
  predicate: Predicate<CardView>
): Getter<CardView[]> {
  return {
    print: `filterCards(${predicate.print})`,
    get: (s) => {
      const all = values(toView(s).cards);
      return all.filter((c) => predicate.eval(c, s));
    },
  };
}

export function and<T>(...filters: Predicate<T>[]): Predicate<T> {
  return {
    print: `${filters.map((f) => f.print).join(" && ")}`,
    eval: (v, s) => filters.every((f) => f.eval(v, s)),
  };
}

export function someCards(predicate: Predicate<CardView>): Getter<boolean> {
  return {
    print: `someCards(${predicate.print})`,
    get: (s) => values(toView(s).cards).some((c) => predicate.eval(c, s)),
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
        const options = cards.map((card) => ({
          title: card.props.name || "",
          action: factory.action(card.id),
          image: card.props.image,
        }));

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
  };
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
          action: factory.action(card.id),
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

export const isCharacter: Predicate<CardView> = {
  print: "isCharacter",
  eval: (card) => {
    const type = card.props.type;
    return type === "hero" || type === "ally";
  },
};

export const isLocation: Predicate<CardView> = {
  print: "isLocation",
  eval: (card) => card.props.type === "location",
};

export const isEnemy: Predicate<CardView> = {
  print: "isEnemy",
  eval: (card) => card.props.type === "enemy",
};

export const isTapped: Predicate<CardView> = {
  print: "isTapped",
  eval: (card, state) => state.cards[card.id].tapped,
};

export const isReady: Predicate<CardView> = {
  print: "isReady",
  eval: (card, state) => !state.cards[card.id].tapped,
};

export function hasMark(type: Mark): Predicate<CardView> {
  return {
    print: "hasMark",
    eval: (card, state) => state.cards[card.id].mark[type],
  };
}

export function not<T>(value: Predicate<T>): Predicate<T> {
  return {
    print: `not(${value.print})`,
    eval: (item, state) => !value.eval(item, state),
  };
}

export function isInZone(zone: Getter<ZoneState>): Predicate<CardView> {
  return {
    print: `isInZone(${zone.print})`,
    eval: (card, state) => zone.get(state)?.cards.includes(card.id) || false,
  };
}

export const commitCharactersToQuest: PlayerAction = {
  print: `commitCharactersToQuest`,
  action: (player) =>
    chooseCardsActions(
      "Commit characters to quest",
      and(isCharacter, isReady, isInZone(playerZone("playerArea", player))),
      commitToQuest
    ),
};

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

export const countOfPlayers: Getter<number> = {
  print: `countOfPlayers`,
  get: (s) => keys(s.players).length,
};

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
  flipCard(topCard(gameZone("encounterDeck")), "face"),
  moveTopCard(gameZone("encounterDeck"), gameZone("stagingArea"), "face")
);

export const totalAttack: Getter<number> = {
  print: "totalAttack",
  get: (s) => {
    const view = toView(s);
    const ids = values(s.cards)
      .filter((c) => c.mark.attacking)
      .map((c) => c.id);

    return ids
      .map((c) => view.cards[c])
      .map((c) => c.props.attack || 0)
      .reduce((p, c) => p + c, 0);
  },
};

export const totalWillpower: Getter<number> = {
  print: "totalWillpower",
  get: (s) => {
    const view = toView(s);
    const ids = values(s.cards)
      .filter((c) => c.mark.questing)
      .map((c) => c.id);

    return ids
      .map((c) => view.cards[c])
      .map((c) => c.props.willpower || 0)
      .reduce((p, c) => p + c, 0);
  },
};

export const totalThread: Getter<number> = {
  print: "totalThread",
  get: (s) => {
    const view = toView(s);
    const ids = s.zones.stagingArea.cards;

    return ids
      .map((c) => view.cards[c])
      .map((c) => c.props.threat || 0)
      .reduce((p, c) => p + c, 0);
  },
};

export function minus(a: Getter<number>, b: Getter<number>): Getter<number> {
  return {
    print: `${a.print} - ${b.print}`,
    get: (s) => {
      const va = a.get(s);
      const vb = b.get(s);
      if (va !== undefined && vb !== undefined) {
        return va - vb;
      }
    },
  };
}

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

export function isMore(a: Getter<number>, b: Getter<number>): Getter<boolean> {
  return {
    print: `${a.print} > ${b.print}`,
    get: (s) => {
      const va = a.get(s);
      const vb = b.get(s);
      if (va !== undefined && vb !== undefined) {
        return va > vb;
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

export const phaseQuest = sequence(
  beginPhase("quest"),
  eachPlayer(commitCharactersToQuest),
  playerActions("Staging"),
  repeat(countOfPlayers, revealEncounterCard),
  playerActions("Quest resolution"),
  resolveQuest(),
  playerActions("End phase"),
  clearMarks("questing")
);

export function travelTo(cardId?: CardId): Action & CardAction {
  return {
    print: `travelTo(${cardId})`,
    action: (id) => travelTo(id),
    apply: (s) => {
      if (cardId) {
        moveCard(
          gameZone("stagingArea"),
          gameZone("activeLocation"),
          "face",
          cardId
        ).apply(s);
      }
    },
  };
}

export const chooseTravelLocation = chooseCardAction(
  "Choose location for travel",
  and(isLocation, isInZone(gameZone("stagingArea"))),
  travelTo(),
  true
);

export const canTravel: Getter<boolean> = {
  print: "canTravel",
  get: (s) => {
    const locations = filterCards(
      and(isLocation, isInZone(gameZone("stagingArea")))
    ).get(s);
    return (
      s.zones.activeLocation.cards.length === 0 &&
      locations &&
      locations.length > 0
    );
  },
};

export const phaseTravel = sequence(
  beginPhase("travel"),
  ifThenElse(canTravel, chooseTravelLocation, sequence()),
  playerActions("End travel phase")
);

export const enemiesToEngage: Getter<boolean> = {
  print: "enemiesToEngage",
  get: (s) => {
    const view = toView(s);
    return values(s.players).some((p) => {
      const cards = s.zones.stagingArea.cards.map((c) => view.cards[c]);
      return cards.some(
        (c) =>
          c.props.type === "enemy" &&
          c.props.engagement &&
          c.props.engagement <= p.thread
      );
    });
  },
};

export function withMaxEngagement(player: PlayerId): Predicate<CardView> {
  return {
    print: "withMaxEngagement",
    eval: (card, state) => {
      const threat = state.players[player]!.thread;
      const view = toView(state);
      const cards = state.zones.stagingArea.cards
        .map((c) => view.cards[c])
        .filter(
          (c) =>
            c.props.type === "enemy" &&
            c.props.engagement &&
            c.props.engagement <= threat
        );

      const max = cards
        .filter((c) => c.props.engagement !== undefined)
        .map((c) => c.props.engagement!)
        .reduce((p, c) => (p > c ? p : c), 0);

      return card.props.engagement === max;
    },
  };
}

export function engagementCheck(player?: PlayerId): Action & PlayerAction {
  return {
    print: `engagementCheck(${player})`,
    action: (id) => engagementCheck(id),
    apply: (s) => {
      if (player) {
        chooseCardAction(
          "Choose enemy to engage",
          and(withMaxEngagement(player), isInZone(gameZone("stagingArea"))),
          moveCard(
            gameZone("stagingArea"),
            playerZone("engaged", player),
            "face"
          ),
          false
        ).apply(s);
      }
    },
  };
}

export const phaseEncounter = sequence(
  beginPhase("encounter"),
  eachPlayer(optionalEngagement()),
  playerActions("Engagement Checks"),
  whileDo(enemiesToEngage, eachPlayer(engagementCheck())),
  playerActions("Next encounter phase")
);

export function resolveEnemyAttack(
  player: PlayerId,
  attacker?: number
): Action & CardAction {
  return {
    print: `resolveEnemyAttack(${player}, ${attacker})`,
    action: (id) => resolveEnemyAttack(player, id),
    apply: (s) => {
      if (attacker) {
        sequence(
          mark("attacked", attacker),
          playerActions("Declare defender"),
          declareDefender(attacker, player)
        ).apply(s);
      }
    },
  };
}

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

export function getProp(
  property: "attack" | "defense" | "hitPoints" | "cost",
  cardId: CardId
): Getter<number> {
  return {
    print: `getProp(${property}, ${cardId})`,
    get: (s) => {
      const card = toView(s).cards[cardId];
      if (card) {
        return card.props[property];
      }
    },
  };
}

export function dealDamage(
  damage: Getter<number>,
  attackers: CardId[],
  defender?: CardId
): Action & CardAction {
  return {
    print: `dealDamage(${damage.print}, [${attackers.join(
      ", "
    )}], ${defender})`,
    action: (id) => dealDamage(damage, attackers, id),
    apply: (s) => {
      if (defender) {
        const amount = damage.get(s);
        if (amount) {
          s.cards[defender].token.damage += amount;
        }
      }
    },
  };
}

export function resolveDefense(
  attacker: CardId,
  defender?: CardId
): Action & CardAction {
  return {
    print: `resolveDefense(${attacker}, ${defender})`,
    action: (id) => resolveDefense(attacker, id),
    apply: (s) => {
      if (defender) {
        const damage = minus(
          getProp("attack", attacker),
          getProp("defense", defender)
        );
        ifThenElse(
          isMore(damage, value(0)),
          dealDamage(damage, [attacker], defender),
          sequence()
        ).apply(s);
      }
    },
  };
}

export function declareDefender(attacker: CardId, player: PlayerId): Action {
  return {
    print: `declareDefender(${attacker}, ${player})`,
    apply: (state) => {
      const cards = filterCards(
        and(isReady, isCharacter, isInZone(playerZone("playerArea", player)))
      ).get(state);

      if (cards) {
        const action = chooseOne("Declare defender", [
          ...cards.map((defender) => ({
            image: defender.props.image,
            title: defender.props.name || "",
            action: sequence(
              tap(defender.id),
              resolveDefense(attacker, defender.id)
            ),
          })),
          {
            title: "No defender",
            action: chooseCardAction(
              "Choose hero for undefended attack",
              and(isHero, isInZone(playerZone("playerArea", player))),
              dealDamage(getProp("attack", attacker), [attacker]),
              false
            ),
          },
        ]);

        action.apply(state);
      }
    },
  };
}

export function resolveEnemyAttacks(player?: PlayerId): Action & PlayerAction {
  return {
    print: `resolveEnemyAttacks(${player})`,
    action: (id) => resolveEnemyAttacks(id),
    apply: (s) => {
      if (player) {
        const attackers = and(
          isEnemy,
          not(hasMark("attacked")),
          isInZone(playerZone("engaged", player))
        );

        whileDo(
          someCards(attackers),
          chooseCardAction(
            "Choose enemy attacker",
            attackers,
            resolveEnemyAttack(player),
            false
          )
        ).apply(s);
      }
    },
  };
}

export function cardActionSequence(...actions: CardAction[]): CardAction {
  return {
    print: `cardActionSequence(${actions.map((a) => a.print).join(", ")})`,
    action: (id) => sequence(...actions.map((a) => a.action(id))),
  };
}

export function declareAttackers(enemy: CardId, player: PlayerId): Action {
  return {
    print: `declareAttackers(${enemy}, ${player})`,
    apply: (state) => {
      chooseCardsActions(
        "Declare attackers",
        and(isReady, isCharacter, isInZone(playerZone("playerArea", player))),
        cardActionSequence(mark("attacking"), tap())
      ).apply(state);
    },
  };
}

export function resolvePlayerAttack(
  player: PlayerId,
  enemy?: CardId
): Action & CardAction {
  return {
    print: `resolvePlayerAttack(${player}, ${enemy})`,
    action: (id) => resolvePlayerAttack(player, id),
    apply: (s) => {
      if (enemy) {
        const damage = minus(totalAttack, getProp("defense", enemy));
        sequence(
          playerActions("Declare attackers"),
          declareAttackers(enemy, player),
          playerActions("Determine combat damage"),
          ifThenElse(
            isMore(damage, value(0)),
            dealDamage(damage, [], enemy),
            sequence()
          ),
          clearMarks("attacking"),
          mark("attacked", enemy)
        ).apply(s);
      }
    },
  };
}

export function resolvePlayerAttacks(player?: PlayerId): Action & PlayerAction {
  return {
    print: `resolvePlayerAttacks(${player})`,
    action: (id) => resolvePlayerAttacks(id),
    apply: (s) => {
      if (player) {
        const enemies = filterCards(
          and(
            isEnemy,
            not(hasMark("attacked")),
            isInZone(playerZone("engaged", player))
          )
        ).get(s);

        const attackers = filterCards(
          and(isReady, isCharacter, isInZone(playerZone("playerArea", player)))
        ).get(s);

        if (enemies && attackers && attackers.length > 0) {
          chooseOne("Choose enemy attacker", [
            ...enemies.map((c) => ({
              action: sequence(
                resolvePlayerAttack(player, c.id),
                resolvePlayerAttacks(player)
              ),
              title: c.props.name || "",
              image: c.props.image,
            })),
            {
              action: sequence(),
              title: "Stop attacking",
            },
          ]).apply(s);
        }
      }
    },
  };
}

export const phaseCombat = sequence(
  beginPhase("combat"),
  // dealShadowCards,
  playerActions("Resolve enemy attacks"),
  eachPlayer(resolveEnemyAttacks()),
  clearMarks("attacked"),
  playerActions("Resolve player attacks"),
  eachPlayer(resolvePlayerAttacks()),
  clearMarks("attacked"),
  playerActions("End combat phase")
);

export function untap(cardId?: CardId): Action & CardAction {
  return {
    print: `untap(${cardId})`,
    action: (id) => untap(id),
    apply: (s) => {
      if (cardId) {
        const card = s.cards[cardId];
        if (card) {
          card.tapped = false;
        }
      }
    },
  };
}

export function optionalEngagement(player?: PlayerId): Action & PlayerAction {
  return {
    print: `optionalEngagement(${player})`,
    action: (id) => optionalEngagement(id),
    apply: (s) => {
      if (player) {
        chooseCardAction(
          "Choose enemy to optionally engage",
          and(isEnemy, isInZone(gameZone("stagingArea"))),
          moveCard(
            gameZone("stagingArea"),
            playerZone("engaged", player),
            "face"
          ),
          true
        ).apply(s);
      }
    },
  };
}

export function generateResource(
  amount: number,
  cardId?: CardId
): Action & CardAction {
  return {
    print: `generateResource(${amount}, ${cardId})`,
    action: (id) => generateResource(amount, id),
    apply: (s) => {
      if (cardId) {
        s.cards[cardId].token.resources += amount;
      }
    },
  };
}

export const phaseRefresh = sequence(
  beginPhase("refresh"),
  eachCard(isTapped, untap()),
  eachPlayer(incrementThreat(value(1))),
  // passFirstPlayerToken,
  playerActions("End refresh phase and round")
);

export const gameRound = sequence(
  phaseResource,
  phasePlanning,
  phaseQuest,
  phaseTravel,
  phaseEncounter,
  phaseCombat,
  phaseRefresh
);

export const startGame = whileDo(value(true), gameRound);

export function createCardState(
  id: CardId,
  definition: CardDefinition,
  side: Side
): CardState {
  return {
    id,
    token: {
      damage: 0,
      progress: 0,
      resources: 0,
    },
    mark: {
      questing: false,
      attacking: false,
      defending: false,
      attacked: false,
    },
    sideUp: side,
    tapped: false,
    definition: definition,
  };
}

export function addPlayer(playerId: PlayerId, deck: PlayerDeck): Action {
  return {
    print: `addPlayer(${playerId}, "${deck.name}")`,
    apply: (s) => {
      const playerIndex = playerIds.findIndex((p) => p === playerId);

      const heroes = deck.heroes.map((h, index) =>
        createCardState(index * 5 + playerIndex + 1, h, "face")
      );

      const library = deck.library.map((l, index) =>
        createCardState(
          (index + heroes.length) * 5 + playerIndex + 1,
          l,
          "back"
        )
      );

      s.players[playerId] = {
        id: playerId,
        thread: heroes
          .map((h) => h.definition.face.threatCost!)
          .reduce((p, c) => p + c, 0),
        zones: {
          hand: { cards: [], stack: false },
          library: { cards: library.map((l) => l.id), stack: true },
          playerArea: { cards: heroes.map((h) => h.id), stack: false },
          discardPile: { cards: [], stack: true },
          engaged: { cards: [], stack: false },
        },
      };

      s.cards = [...heroes, ...library].reduce(
        (p, c) => ({ ...p, [c.id]: c }),
        s.cards
      );
    },
  };
}

export function setupScenario(scenario: Scenario): Action {
  return {
    print: `setupScenario("${scenario.name}")`,
    apply: (s) => {
      const quest = scenario.questCards.map((q, index) =>
        createCardState(index * 5 + 5, q, "back")
      );

      const cards = scenario.encounterCards.map((e, index) =>
        createCardState((index + quest.length) * 5 + 5, e, "back")
      );

      s.zones.encounterDeck.cards.push(...cards.map((c) => c.id));
      s.zones.questDeck.cards.push(...reverse(quest.map((c) => c.id)));

      s.cards = [...quest, ...cards].reduce(
        (p, c) => ({ ...p, [c.id]: c }),
        s.cards
      );
    },
  };
}

export function moveCard(
  from: Getter<ZoneState>,
  to: Getter<ZoneState>,
  side: Side,
  cardId?: CardId
): Action & CardAction {
  return {
    print: `moveCard(${to.print}, ${side},${cardId})`,
    action: (id) => moveCard(from, to, side, id),
    apply: (s) => {
      if (cardId) {
        const card = s.cards[cardId];
        if (card) {
          card.sideUp = side;
          const zoneTo = to.get(s);
          const zoneFrom = from.get(s);
          if (zoneTo && zoneFrom) {
            zoneFrom.cards = zoneFrom.cards.filter((c) => c !== cardId);
            zoneTo.cards.push(cardId);
          }
        }
      }
    },
  };
}

export function addToStagingArea(name: string): Action {
  return {
    print: `addToStagingArea(${name})`,
    apply: (s) => {
      const card = values(s.cards).find((c) => c.definition.face.name === name);
      if (card) {
        moveCard(
          gameZone("encounterDeck"),
          gameZone("stagingArea"),
          "face",
          card.id
        ).apply(s);
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

export function cardView(cardId: CardId): Getter<CardView> {
  return {
    print: `cardView(${cardId})`,
    get: (s) => {
      const view = toView(s);
      return view.cards[cardId];
    },
  };
}

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

export function topCard(getter: Getter<ZoneState>): Getter<CardState> {
  return {
    print: `topCard(${getter.print})`,
    get: (s) => {
      const zone = getter.get(s);
      if (zone) {
        const id = last(zone.cards);
        return id ? s.cards[id] : undefined;
      }
    },
  };
}

export function beginScenario(
  scenario: Scenario,
  ...decks: PlayerDeck[]
): Action {
  return sequence(
    setupScenario(scenario),
    ...decks.map((d, i) => addPlayer(playerIds[i], d)),
    shuffleZone(gameZone("encounterDeck")),
    eachPlayer(shuffleLibrary),
    eachPlayer(draw(6)),
    flipCard(topCard(gameZone("questDeck")), "face"),
    setupActions,
    flipCard(topCard(gameZone("questDeck")), "back"),
    startGame
  );
}

export const shuffleLibrary: PlayerAction = {
  print: "shuffleLibrary",
  action: (player) => shuffleZone(playerZone("library", player)),
};

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

export function gameZone(type: GameZoneType): Getter<ZoneState> {
  return {
    print: `gameZone(${type})`,
    get: (s) => {
      return s.zones[type];
    },
  };
}

export function playerZone(
  type: PlayerZoneType,
  player: PlayerId
): Getter<ZoneState> {
  return {
    print: `playerZone(${type}, ${player})`,
    get: (s) => {
      return s.players[player]?.zones[type];
    },
  };
}

export function shuffleArray<T>(a: T[], order?: number[]) {
  const newOrder: number[] = [];
  for (let i = a.length - 1; i > 0; i--) {
    const j = order
      ? order[a.length - 1 - i]
      : Math.floor(Math.random() * (i + 1));
    newOrder.push(j);
    [a[i], a[j]] = [a[j], a[i]];
  }

  return order ? order : newOrder;
}

export function tap(cardId?: CardId): Action & CardAction {
  return {
    print: `tap(${cardId})`,
    action: (id) => tap(id),
    apply: (s) => {
      if (cardId) {
        const card = s.cards[cardId];
        if (card) {
          card.tapped = true;
        }
      }
    },
  };
}

export function mark(type: Mark, cardId?: CardId): Action & CardAction {
  return {
    print: `mark(${type}, ${cardId})`,
    action: (id) => mark(type, id),
    apply: (s) => {
      if (cardId) {
        const card = s.cards[cardId];
        if (card) {
          card.mark[type] = true;
        }
      }
    },
  };
}

export const commitToQuest: CardAction = {
  print: `commitToQuest`,
  action: (cardId) => sequence(tap(cardId), mark("questing", cardId)),
};
