import {
  addPlayer2,
  addToken2,
  assignToQuest2,
  moveCard2,
  moveTopCard2,
  repeat3,
  setupScenario2,
  shuffleZone2,
  tap2,
  untap2,
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
  action2,
  Action2,
  CardAction3,
  chooseOne2,
  chooseSome2,
  draw2,
  PlayerAction3,
  playerActions2,
  sequence2,
  whileDo2,
} from "./actions2";

export function beginScenario2(scenario: Scenario, ...decks: PlayerDeck[]): Action2 {
  return sequence2(
    setupScenario2(scenario),
    ...decks.map((d, i) => addPlayer2(playerIds[i], d)),
    shuffleZone2(zoneKey("encounterDeck")),
    eachPlayer2((p) => shuffleZone2(zoneKey("library", p))),
    eachPlayer2(draw2(6)),
    moveTopCard2(zoneKey("questDeck"), zoneKey("quest"), "face"),
    startGame
  );
}

export function eachPlayer2(factory: PlayerAction3): Action2 {
  // TODO order
  return {
    print: `each player: ${factory("X").print}`,
    do: (s) => {
      const action = sequence2(...s.players.map((p) => factory(p.id)));
      return action.do(s);
    },
  };
}

export function eachCard2(filter: Filter<CardId>, action: CardAction3): Action2 {
  return {
    print: `each card (${filter(0).print}) {${action(0).print}}`,
    do: (state) => {
      const view = createView(state);
      const cards = filterCards(filter, view);
      const actions = sequence2(...cards.map((card) => action(card.id)));
      return actions.do(state);
    },
  };
}

export function generateResource2(amount: number): CardAction3 {
  return (id) => repeat3(amount, addToken2("resources")(id));
}

export const phaseResource = sequence2(
  eachPlayer2(draw2(1)),
  eachCard2(isHero, generateResource2(1)),
  playerActions2("End resource phase")
);

export const phasePlanning = playerActions2("End planning phase");

export function commitToQuest2(cardId: CardId): Action2 {
  return sequence2(tap2(cardId), assignToQuest2(cardId));
}

export const commitCharactersToQuest2: PlayerAction3 = (player) =>
  chooseCardsForAction2(
    "Commit characters to quest",
    and(isHero, isReady, isInZone(zoneKey("playerArea", player))),
    commitToQuest2
  );

export const phaseQuest = sequence2(
  eachPlayer2(commitCharactersToQuest2),
  playerActions2("Staging"),
  bind2(countOfPlayers, (count) =>
    repeat3(count, moveTopCard2(zoneKey("encounterDeck"), zoneKey("stagingArea"), "face"))
  ),
  playerActions2("Quest resolution"),
  bind2(diff(totalWillpower, totalThread), (power) =>
    power > 0 ? placeProgress2(power) : eachPlayer2(incrementThreat2(-power))
  ),
  playerActions2("End phase")
);

export function placeProgress2(amount: number): Action2 {
  return action2(`place ${amount} progress`, (state) => {
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

export function incrementThreat2(amount: number): PlayerAction3 {
  return (id) =>
    action2(`player ${id}: increment threat by ${amount}`, (s) => {
      const player = s.players.find((p) => p.id === id);
      if (player) {
        player.thread += amount;
        return "full";
      } else {
        return "none";
      }
    });
}

export function chooseCardsForAction2(
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
      const action = chooseSome2(title, choices);
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

export function bind2<T>(exp: Exp<T>, factory: (v: T) => Action2): Action2 {
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

export function chooseCardForAction3(title: string, filter: Filter<CardId>, cardAction: CardAction3): Action2 {
  return {
    print: `choose card for action ${cardAction(0).print}`,
    do: (state) => {
      const cards = filterCards(filter, createView(state));
      const action = chooseOne2(
        title,
        cards.map((c) => cardAction(c.id))
      );

      if (cards.length === 0) {
        return sequence2().do(state);
      }

      return action.do(state);
    },
  };
}

export const phaseTravel = sequence2(
  // TODO allow no travel
  bind2(canTravel, (can) =>
    can ? chooseCardForAction3("Choose location for travel", isLocation, travelToLocation2()) : sequence2()
  ),
  playerActions2("End travel phase")
);

export const passFirstPlayerToken: Action2 = action2("pass first player token", (state) => {
  // TODO
  return "full";
});

export const phaseRefresh = sequence2(
  eachCard2(isTapped, untap2),
  eachPlayer2(incrementThreat2(1)),
  passFirstPlayerToken,
  playerActions2("End refresh phase and round")
);

export function travelToLocation2() {
  return moveCard2(zoneKey("stagingArea"), zoneKey("activeLocation"), "face");
}

export const optionalEngagement: PlayerAction3 = (player) =>
  // TODO no engagement
  chooseCardForAction3(
    "Choose enemy to optionally engage",
    and(isInZone(zoneKey("stagingArea")), isEnemy),
    engagePlayer2(player)
  );

export const engagementCheck2: PlayerAction3 = (player) =>
  chooseCardForAction3("Choose enemy to engage", withMaxEngagement(player), engagePlayer2(player));

export const phaseEncounter = sequence2(
  eachPlayer2(optionalEngagement),
  playerActions2("Engagement Checks"),
  whileDo2(enemiesToEngage, eachPlayer2(engagementCheck2)),
  playerActions2("Next encounter phase")
);

export function engagePlayer2(player: PlayerId): CardAction3 {
  return moveCard2(zoneKey("stagingArea"), zoneKey("engaged", player), "face");
}

export function resolveEnemyAttacks(playerId: PlayerId) {
  const enemies: Filter<CardId> = and(isEnemy, isInZone(zoneKey("engaged", playerId)));
  return chooseCardActionOrder2("Choose enemy attacker", enemies, resolveEnemyAttack(playerId));
}

export function resolveEnemyAttack(playerId: PlayerId): CardAction3 {
  return (attackerId) => {
    // TODO shadow effect
    return sequence2(playerActions2("Declare defender"), declareDefender(attackerId, playerId));
  };
}

export function declareDefender(attackerId: CardId, playerId: PlayerId): Action2 {
  const filter = and((id) => negate(isTapped(id)), isCharacter, isInZone(zoneKey("playerArea", playerId)));
  return {
    print: "declare defender",
    do: (state) => {
      const view = createView(state);
      const cards = filterCards(filter, view);

      const action = chooseOne2("Declare defender", [
        ...cards.map((c) => sequence2(tap2(c.id), resolveDefense(attackerId)(c.id))),
        chooseCardForAction3(
          "Choose hero for undefended attack",
          and(isHero, isInZone(zoneKey("playerArea", playerId))),
          (hero) => bind2(getProp("attack", attackerId), (attack) => dealDamage3(attack)(hero))
        ),
      ]);

      return action.do(state);
    },
  };
}

export function dealDamage3(amount: number): CardAction3 {
  return (card) => repeat3(amount, addToken2("damage")(card));
}

export function resolveDefense(attacker: CardId): CardAction3 {
  return (defender) =>
    bind2(diff(getProp("attack", attacker), getProp("defense", defender)), (damage) =>
      damage > 0 ? dealDamage3(damage)(defender) : sequence2()
    );
}

export function chooseCardActionOrder2(
  title: string,
  filter: Filter<CardId>,
  action: CardAction3,
  used: CardId[] = []
): Action2 {
  return {
    print: `choose card order for cards ${filter(0).print} and action ${action(0).print}`,
    do: (s) => {
      const cards = filterCards(filter, createView(s)).filter((c) => !used.includes(c.id));
      if (cards.length === 0) {
        return sequence2().do(s);
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
              action: sequence2(action(c.id), chooseCardActionOrder2(title, filter, action, [...used, c.id])),
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
  return sequence2();
}

export const dealShadowCards =
  // TODO all
  sequence2();

export const phaseCombat = sequence2(
  dealShadowCards,
  playerActions2("Resolve enemy attacks"),
  eachPlayer2(resolveEnemyAttacks),
  playerActions2("Resolve player attacks"),
  eachPlayer2(resolvePlayerAttacks),
  playerActions2("End combat phase")
);

export const gameRound = sequence2(
  phaseResource,
  phasePlanning,
  phaseQuest,
  phaseTravel,
  phaseEncounter,
  phaseCombat,
  phaseRefresh
);

//  TODO ending condition
export const startGame = whileDo2(lit(true), gameRound);
