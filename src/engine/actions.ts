import {
  addPlayer,
  addToken,
  assignToQuest,
  moveCard,
  moveTopCard,
  repeat,
  setupScenario,
  shuffleZone,
  tap,
  untap,
  zoneKey,
} from "./commands";
import {
  and,
  countOfPlayers,
  diff,
  enemiesToEngage,
  Exp,
  Filter,
  filterCards,
  getProp,
  isCharacter,
  isEnemy,
  isHero,
  isInZone,
  isLocation,
  isTapped,
  lit,
  negate,
  totalThread,
  totalWillpower,
  withMaxEngegament as withMaxEngagement,
  isReady,
  canTravel,
} from "./filters";
import { Scenario, PlayerDeck } from "./setup";
import { CardId, PlayerId, playerIds } from "./state";
import { CardView, createView } from "./view";
import {
  action,
  Action2,
  CardAction,
  chooseOne,
  chooseSome,
  draw,
  PlayerAction,
  playerActions,
  sequence,
  whileDo,
} from "./actions2";

export function beginScenario(scenario: Scenario, ...decks: PlayerDeck[]): Action2 {
  return sequence(
    setupScenario(scenario),
    ...decks.map((d, i) => addPlayer(playerIds[i], d)),
    shuffleZone(zoneKey("encounterDeck")),
    eachPlayer((p) => shuffleZone(zoneKey("library", p))),
    eachPlayer(draw(6)),
    moveTopCard(zoneKey("questDeck"), zoneKey("quest"), "face"),
    startGame
  );
}

export function eachPlayer(factory: PlayerAction): Action2 {
  // TODO order
  return {
    print: `each player: ${factory("X").print}`,
    do: (s) => {
      const action = sequence(...s.players.map((p) => factory(p.id)));
      return action.do(s);
    },
  };
}

export function eachCard(filter: Filter<CardId>, action: CardAction): Action2 {
  return {
    print: `each card (${filter(0).print}) {${action(0).print}}`,
    do: (state) => {
      const view = createView(state);
      const cards = filterCards(filter, view);
      const actions = sequence(...cards.map((card) => action(card.id)));
      return actions.do(state);
    },
  };
}

export function generateResource(amount: number): CardAction {
  return (id) => repeat(amount, addToken("resources")(id));
}

export const phaseResource = sequence(
  eachPlayer(draw(1)),
  eachCard(isHero, generateResource(1)),
  playerActions("End resource phase")
);

export const phasePlanning = playerActions("End planning phase");

export function commitToQuest(cardId: CardId): Action2 {
  return sequence(tap(cardId), assignToQuest(cardId));
}

export const commitCharactersToQuest: PlayerAction = (player) =>
  chooseCardsForAction(
    "Commit characters to quest",
    and(isHero, isReady, isInZone(zoneKey("playerArea", player))),
    commitToQuest
  );

export const phaseQuest = sequence(
  eachPlayer(commitCharactersToQuest),
  playerActions("Staging"),
  bind(countOfPlayers, (count) =>
    repeat(count, moveTopCard(zoneKey("encounterDeck"), zoneKey("stagingArea"), "face"))
  ),
  playerActions("Quest resolution"),
  bind(diff(totalWillpower, totalThread), (power) =>
    power > 0 ? placeProgress(power) : eachPlayer(incrementThreat(-power))
  ),
  playerActions("End phase")
);

export function placeProgress(amount: number): Action2 {
  return action(`place ${amount} progress`, (state) => {
    const cardId = state.zones.quest.cards[0];
    const card = state.cards.find((c) => c.id === cardId);
    if (card) {
      card.progress += amount;
      return "full";
    } else {
      return "none";
    }
  });
}

export function incrementThreat(amount: number): PlayerAction {
  return (id) =>
    action(`player ${id}: increment threat by ${amount}`, (s) => {
      const player = s.players.find((p) => p.id === id);
      if (player) {
        player.thread += amount;
        return "full";
      } else {
        return "none";
      }
    });
}

export function chooseCardsForAction(
  title: string,
  filter: Filter<CardId>,
  factory: (id: CardId) => Action2
): Action2 {
  return {
    print: `choose cards for action: [${factory(0).print}]`,
    do: (state) => {
      const view = createView(state);
      const cards = filterCards(filter, view);
      const choices = cards.map((card) => ({
        label: card.props.name || "",
        action: factory(card.id),
        image: card.props.image,
      }));
      const action = chooseSome(title, choices);
      return action.do(state);
    },
  };
}

export function filteredCards(filter: Filter<CardId>): Exp<CardView[]> {
  return {
    print: `cards that ${filter(0)}`,
    eval: (v) => filterCards(filter, v),
  };
}

export function bind<T>(exp: Exp<T>, factory: (v: T) => Action2): Action2 {
  return {
    // TODO x
    print: factory("x" as any).print,
    do: (state) => {
      const value = exp.eval(createView(state));
      const action = factory(value);
      return action.do(state);
    },
  };
}

export function chooseCardForAction(title: string, filter: Filter<CardId>, cardAction: CardAction): Action2 {
  return {
    print: `choose card for action ${cardAction(0).print}`,
    do: (state) => {
      const cards = filterCards(filter, createView(state));
      const action = chooseOne(
        title,
        cards.map((c) => cardAction(c.id))
      );

      if (cards.length === 0) {
        return sequence().do(state);
      }

      return action.do(state);
    },
  };
}

export const phaseTravel = sequence(
  // TODO allow no travel
  bind(canTravel, (can) =>
    can ? chooseCardForAction("Choose location for travel", isLocation, travelToLocation()) : sequence()
  ),
  playerActions("End travel phase")
);

export const passFirstPlayerToken: Action2 = action("pass first player token", (state) => {
  // TODO
  return "full";
});

export const phaseRefresh = sequence(
  eachCard(isTapped, untap),
  eachPlayer(incrementThreat(1)),
  passFirstPlayerToken,
  playerActions("End refresh phase and round")
);

export function travelToLocation() {
  return moveCard(zoneKey("stagingArea"), zoneKey("activeLocation"), "face");
}

export const optionalEngagement: PlayerAction = (player) =>
  // TODO no engagement
  chooseCardForAction(
    "Choose enemy to optionally engage",
    and(isInZone(zoneKey("stagingArea")), isEnemy),
    engagePlayer(player)
  );

export const engagementCheck: PlayerAction = (player) =>
  chooseCardForAction("Choose enemy to engage", withMaxEngagement(player), engagePlayer(player));

export const phaseEncounter = sequence(
  eachPlayer(optionalEngagement),
  playerActions("Engagement Checks"),
  whileDo(enemiesToEngage, eachPlayer(engagementCheck)),
  playerActions("Next encounter phase")
);

export function engagePlayer(player: PlayerId): CardAction {
  return moveCard(zoneKey("stagingArea"), zoneKey("engaged", player), "face");
}

export function resolveEnemyAttacks(playerId: PlayerId) {
  const enemies: Filter<CardId> = and(isEnemy, isInZone(zoneKey("engaged", playerId)));
  return chooseCardActionOrder("Choose enemy attacker", enemies, resolveEnemyAttack(playerId));
}

export function resolveEnemyAttack(playerId: PlayerId): CardAction {
  return (attackerId) => {
    // TODO shadow effect
    return sequence(playerActions("Declare defender"), declareDefender(attackerId, playerId));
  };
}

export function declareDefender(attackerId: CardId, playerId: PlayerId): Action2 {
  const filter = and((id) => negate(isTapped(id)), isCharacter, isInZone(zoneKey("playerArea", playerId)));
  return {
    print: "declare defender",
    do: (state) => {
      const view = createView(state);
      const cards = filterCards(filter, view);

      const action = chooseOne("Declare defender", [
        ...cards.map((c) => sequence(tap(c.id), resolveDefense(attackerId)(c.id))),
        chooseCardForAction(
          "Choose hero for undefended attack",
          and(isHero, isInZone(zoneKey("playerArea", playerId))),
          (hero) => bind(getProp("attack", attackerId), (attack) => dealDamage(attack)(hero))
        ),
      ]);

      return action.do(state);
    },
  };
}

export function dealDamage(amount: number): CardAction {
  return (card) => repeat(amount, addToken("damage")(card));
}

export function resolveDefense(attacker: CardId): CardAction {
  return (defender) =>
    bind(diff(getProp("attack", attacker), getProp("defense", defender)), (damage) =>
      damage > 0 ? dealDamage(damage)(defender) : sequence()
    );
}

export function chooseCardActionOrder(
  title: string,
  filter: Filter<CardId>,
  action: CardAction,
  used: CardId[] = []
): Action2 {
  return {
    print: `choose card order for cards ${filter(0).print} and action ${action(0).print}`,
    do: (s) => {
      const cards = filterCards(filter, createView(s)).filter((c) => !used.includes(c.id));
      if (cards.length === 0) {
        return sequence().do(s);
      } else {
        return {
          state: s,
          effect: "full",
          choice: {
            title,
            multiple: false,
            dialog: true,
            choices: cards.map((c) => ({
              label: c.props.name || "",
              action: sequence(action(c.id), chooseCardActionOrder(title, filter, action, [...used, c.id])),
              image: c.props.image,
            })),
          },
          next: undefined,
        };
      }
    },
  };
}

export function resolvePlayerAttacks(playerId: PlayerId) {
  // TODO all
  return sequence();
}

export const dealShadowCards =
  // TODO all
  sequence();

export const phaseCombat = sequence(
  dealShadowCards,
  playerActions("Resolve enemy attacks"),
  eachPlayer(resolveEnemyAttacks),
  playerActions("Resolve player attacks"),
  eachPlayer(resolvePlayerAttacks),
  playerActions("End combat phase")
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

//  TODO ending condition
export const startGame = whileDo(lit(true), gameRound);
