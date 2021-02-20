import {
  addPlayer,
  addToken,
  assignToQuest,
  batch,
  moveCard,
  moveTopCard,
  noCommand,
  repeat,
  setFirstPlayer,
  setupScenario,
  shuffleZone,
  tap,
  untap,
  zoneKey,
} from "./commands";
import {
  all,
  and,
  diff,
  enemiesToEngage,
  Exp,
  Filter,
  filterCards,
  isCharacter,
  isEnemy,
  isHero,
  isInZone,
  isLess,
  isLocation,
  isMore,
  isSame,
  isTapped,
  isThereActiveLocation,
  lit,
  negate,
  nextPlayerId,
  totalThread,
  totalWillpower,
  withMaxEngegament,
} from "./filters";
import { Scenario, PlayerDeck } from "./setup";
import { CardId, PlayerId, playerIds } from "./state";
import { Action, CardAction, Command, PlayerAction } from "./types";
import { CardView, createView } from "./view";
import { PowerSet } from "js-combinatorics";
import { getActionResult } from "./engine";

export const draw: (amount: number) => PlayerAction = (amount) => (player) => {
  return action(
    repeat(lit(amount), moveTopCard(zoneKey("library", player), zoneKey("hand", player), "face")),
    `player ${player} draws ${amount} cards`
  );
};

export function action(cmd: Command, print?: string): Action {
  return {
    print: print ?? cmd.print,
    do: async (e) => e.exec(cmd),
    commands: () => [{ first: cmd, next: [] }],
  };
}

export function sequence(...actions: Action[]): Action {
  return {
    print: `sequence: \r\n${actions.map((a) => "\t" + a.print).join("\r\n")}`,
    do: async (engine) => {
      for (const act of actions) {
        await engine.do(act);
      }
    },
    commands: (s) => {
      if (actions.length === 0) {
        return [{ first: noCommand, next: [] }];
      }
      const cmds = actions[0].commands(s);
      return cmds.map((c) => {
        return { first: c.first, next: [...c.next, ...actions.slice(1)] };
      });
    },
  };
}

export function choosePlayerForAct(player: PlayerId, factory: (id: PlayerId) => Action): Action {
  return {
    print: `choose player for action: [${factory("X").print}]`,
    do: async (engine) => {
      const actions = engine.state.players.map((p) => ({ label: p.id.toString(), value: factory(p.id) }));
      await engine.chooseNextAction("Choose player", actions);
    },
    commands: (s) => {
      return s.players.flatMap((p) => factory(p.id).commands(s));
    },
  };
}

export const noAction: Action = {
  print: "no action",
  do: async () => {},
  commands: () => [],
};

export function beginScenario(scenario: Scenario, ...decks: PlayerDeck[]): Action {
  return sequence(
    action(
      batch(
        setupScenario(scenario),
        ...decks.map((d, i) => addPlayer(playerIds[i], d)),
        shuffleZone(zoneKey("encounterDeck"))
      )
    ),
    eachPlayer((p) => action(shuffleZone(zoneKey("library", p)))),
    eachPlayer(draw(6)),
    action(moveTopCard(zoneKey("questDeck"), zoneKey("quest"), "face"))
  );
}

export function eachPlayer(factory: PlayerAction): Action {
  // TODO order
  return {
    print: `each player: ${factory("X").print}`,
    do: async (engine) => {
      const action = sequence(...engine.state.players.map((p) => factory(p.id)));
      await action.do(engine);
    },
    commands: (s) => sequence(...s.players.map((p) => factory(p.id))).commands(s),
  };
}

export function eachCard(filter: Filter<CardId>, action: CardAction): Action {
  return {
    print: `each card that ${filter(0).print}: ${action(0).print}`,
    do: async (engine) => {
      const view = createView(engine.state);
      const cards = filterCards(filter, view);
      const actions = sequence(...cards.map((card) => action(card.id)));
      actions.do(engine);
    },
    commands: (s) => {
      const view = createView(s);
      const cards = filterCards(filter, view);
      return sequence(...cards.map((card) => action(card.id))).commands(s);
    },
  };
}

export function generateResource(amount: number): CardAction {
  return (id) => action(repeat(lit(amount), addToken(id, "resources")));
}

export function phaseResource(): Action {
  return sequence(eachPlayer(draw(1)), eachCard(isHero, generateResource(1)), playerActions("Next phase"));
}

export function phasePlanning(): Action {
  return playerActions("Next phase");
}

export function commitToQuest(cardId: CardId): Action {
  return sequence(action(tap(cardId)), action(assignToQuest(cardId)));
}

export function phaseQuest(): Action {
  // TODO characteris in play, action reveal card for each player
  return sequence(
    chooseCardsForAction(isHero, commitToQuest),
    playerActions("Reveal encounter cards"),
    action(moveTopCard(zoneKey("encounterDeck"), zoneKey("stagingArea"), "face")),
    action(moveTopCard(zoneKey("encounterDeck"), zoneKey("stagingArea"), "face")),
    action(moveTopCard(zoneKey("encounterDeck"), zoneKey("stagingArea"), "face")),
    action(moveTopCard(zoneKey("encounterDeck"), zoneKey("stagingArea"), "face")),
    action(moveTopCard(zoneKey("encounterDeck"), zoneKey("stagingArea"), "face")),
    action(moveTopCard(zoneKey("encounterDeck"), zoneKey("stagingArea"), "face")),
    action(moveTopCard(zoneKey("encounterDeck"), zoneKey("stagingArea"), "face")),
    action(moveTopCard(zoneKey("encounterDeck"), zoneKey("stagingArea"), "face")),
    action(moveTopCard(zoneKey("encounterDeck"), zoneKey("stagingArea"), "face")),
    action(moveTopCard(zoneKey("encounterDeck"), zoneKey("stagingArea"), "face")),
    action(moveTopCard(zoneKey("encounterDeck"), zoneKey("stagingArea"), "face")),
    action(moveTopCard(zoneKey("encounterDeck"), zoneKey("stagingArea"), "face")),
    playerActions("Resolve quest"),
    ifThen(
      isLess(totalWillpower, totalThread),
      eachPlayer((p) => action(incrementThreat(diff(totalThread, totalWillpower))(p)))
    ),
    ifThen(isMore(totalWillpower, totalThread), placeProgress(diff(totalWillpower, totalThread))),
    playerActions("Next phase")
  );
}

export function placeProgress(amount: Exp<number>): Action {
  return {
    // TODO location -> quest
    print: `place (${amount.print}) progress to active location`,
    do: async (e) => {
      const card = e.state.zones.quest.cards[0];
      const cmd = repeat(amount, addToken(card, "progress"));
      e.exec(cmd);
    },
    // TODO
    commands: (s) => {
      const card = s.zones.quest.cards[0];
      const cmd = repeat(amount, addToken(card, "progress"));
      return [{ first: cmd, next: [] }];
    },
  };
}

export function incrementThreat(amount: Exp<number>): (playerId: PlayerId) => Command {
  return (id) => ({
    print: `player ${id} increment threat by ${amount.print}`,
    do: (s) => {
      s.players.find((p) => p.id === id)!.thread += amount.eval(createView(s));
    },
    result: () => "full",
  });
}

export function chooseCardsForAction(filter: Filter<CardId>, factory: (id: CardId) => Action): Action {
  return {
    print: `choose cards for action: [${factory(0).print}]`,
    do: async (engine) => {
      const view = createView(engine.state);
      const cards = filterCards(filter, view);
      const actions = cards.map((card) => ({
        label: card.props.name || "",
        value: factory(card.id),
        image: card.props.image,
      }));
      await engine.chooseNextActions("Choose cards", actions);
    },
    commands: (s) => {
      const view = createView(s);
      const cards = filterCards(filter, view);
      const actions = cards.map((card) => factory(card.id)).filter((a) => getActionResult(a, s) !== "none");
      const combinations = [...PowerSet.of(actions)] as Action[][];
      return combinations.flatMap((list) => sequence(...list).commands(s));
    },
  };
}

export function chooseAction(title: string, choices: Array<{ label: string; image?: string; value: Action }>): Action {
  return {
    print: `chooseAction: ${choices.map((c) => c.value.print).join(" / ")}`,
    do: async (engine) => {
      await engine.chooseNextAction(title, choices);
    },
    commands: (s) => {
      const valid = choices.filter((c) => getActionResult(c.value, s) !== "none");
      const commands = valid.flatMap((choice) => choice.value.commands(s));
      return commands;
    },
  };
}

export function chooseActions(title: string, choices: Array<{ label: string; image?: string; value: Action }>): Action {
  return {
    print: `chooseActions: ${choices.map((c) => c.value.print).join(" / ")}`,
    do: async (engine) => {
      await engine.chooseNextAction(title, choices);
    },
    commands: (s) => {
      const valid = choices.filter((c) => getActionResult(c.value, s) !== "none");
      const commands = valid.flatMap((choice) => choice.value.commands(s));
      return commands;
    },
  };
}

export function chooseCardForAction2(title: string, filter: Filter<CardId>, factory: (id: CardId) => Action): Action {
  return {
    print: `choose card for action: [${factory(0).print}]`,
    do: async (engine) => {
      const view = createView(engine.state);
      const cards = filterCards(filter, view);
      const actions = cards.map((card) => ({
        label: card.props.name || "",
        value: factory(card.id),
        image: card.props.image,
      }));
      await engine.chooseNextAction(title, actions);
    },
    commands: (s) => {
      const view = createView(s);
      const cards = filterCards(filter, view);
      const actions = cards.map((card) => factory(card.id)).filter((a) => getActionResult(a, s) !== "none");
      const commands = actions.flatMap((action) => action.commands(s));
      return commands;
    },
  };
}

export function filteredCards(filter: Filter<CardId>): Exp<CardView[]> {
  return {
    print: `cards that ${filter(0)}`,
    eval: (v) => filterCards(filter, v),
  };
}

export function chooseCardForAction(title: string, filter: Filter<CardId>, factory: (id: CardId) => Action): Action {
  return bindAction(`choose card for action: [${factory(0).print}]`, filteredCards(filter), (ids) =>
    chooseAction(
      title,
      ids.map((card) => ({
        label: card.props.name || "",
        value: factory(card.id),
        image: card.props.image,
      }))
    )
  );
}

export function bindAction<T>(print: string, exp: Exp<T>, factory: (value: T) => Action): Action {
  return {
    print,
    do: async (e) => {
      const value = exp.eval(createView(e.state));
      const action = factory(value);
      return await e.do(action);
    },
    commands: (s) => {
      const value = exp.eval(createView(s));
      const action = factory(value);
      return action.commands(s);
    },
  };
}

export function playerActions(title: string): Action {
  return {
    print: "player actions",
    do: async (engine) => {
      await engine.playerActions(title);
    },
    commands: () => [], // TODO commands
  };
}

export function ifThen(condition: Exp<boolean>, action: Action): Action {
  return {
    print: `if ${condition.print} then ${action.print}`,
    do: async (e) => {
      const view = createView(e.state);
      const result = condition.eval(view);
      if (result) {
        await e.do(action);
      }
    },
    commands: () => [],
  };
}

export function phaseTravel(): Action {
  return sequence(
    // TODO allow no travel
    ifThen(
      negate(isThereActiveLocation),
      chooseCardForAction("Choose location for travel", isLocation, travelToLocation)
    ),
    playerActions("Next")
  );
}

export function phaseRefresh(): Action {
  return sequence(
    eachCard(isTapped, ready),
    changeFirstPlayerToNext,
    eachPlayer((p) => action(incrementThreat(lit(1))(p))),
    playerActions("Next round")
  );
}

export function ready(cardId: CardId): Action {
  return action(untap(cardId));
}

export function travelToLocation(cardId: CardId): Action {
  return action(moveCard(cardId, zoneKey("stagingArea"), zoneKey("activeLocation"), "face"));
}

export const changeFirstPlayerToNext: Action = bindAction("change first player to next", nextPlayerId, (p) =>
  action(setFirstPlayer(p))
);

export function phaseEncounter(): Action {
  return sequence(
    eachPlayer(chooseEnemyToOptionalEngage),
    whileDo(enemiesToEngage, eachPlayer(engagementCheck)),
    playerActions("Next"),
    playerActions("Next phase")
  );
}

export function chooseEnemyToOptionalEngage(player: PlayerId): Action {
  // TODO no engagement
  return chooseCardForAction("Choose enemy to optional engage", and(isInZone(zoneKey("stagingArea")), isEnemy), (id) =>
    action(moveCard(id, zoneKey("stagingArea"), zoneKey("engaged", player), "face"))
  );
}

export function engagementCheck(player: PlayerId): Action {
  return chooseCardForAction("Choose enemy to engage", withMaxEngegament(player), engagePlayer(player));
}

export function engagePlayer(player: PlayerId): CardAction {
  return (cardId) => action(moveCard(cardId, zoneKey("stagingArea"), zoneKey("engaged", player), "face"));
}

export function whileDo(exp: Exp<boolean>, act: Action): Action {
  return {
    print: `while ${exp.print} do ${act.print}`,
    do: async (e) => {
      while (exp.eval(createView(e.state))) {
        await act.do(e);
      }
    },
    //TODO
    commands: () => [],
  };
}
