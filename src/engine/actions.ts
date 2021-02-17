import {
  addPlayer,
  addToken,
  assignToQuest,
  batch,
  moveCard,
  moveTopCard,
  noCommand,
  repeat,
  setupScenario,
  shuffleZone,
  tap,
  zoneKey,
} from "./commands";
import {
  diff,
  Exp,
  Filter,
  filterCards,
  isCharacter,
  isHero,
  isLess,
  isLocation,
  isMore,
  isSame,
  isThereActiveLocation,
  lit,
  negate,
  totalThread,
  totalWillpower,
} from "./filters";
import { Scenario, PlayerDeck } from "./setup";
import { CardId, PlayerId, playerIds } from "./state";
import { Action, CardAction, Command, PlayerAction } from "./types";
import { createView } from "./view";
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
  return {
    print: `each player: ${factory("X").print}`,
    do: async (engine) => {
      const action = sequence(...engine.state.players.map((p) => factory(p.id)));
      action.do(engine);
    },
    commands: (s) => sequence(...s.players.map((p) => factory(p.id))).commands(s),
  };
}

export function eachCard(filter: Filter<CardId>, action: CardAction): Action {
  return {
    print: `each card that ${filter(0).print}: ${action(0).print}`,
    do: async (engine) => {
      const view = createView(engine.state);
      const cardIds = filterCards(filter, view);
      const actions = sequence(...cardIds.map((id) => action(id)));
      actions.do(engine);
    },
    commands: (s) => {
      const view = createView(s);
      const cardIds = filterCards(filter, view);
      return sequence(...cardIds.map((id) => action(id))).commands(s);
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
  // TODO characteris in play
  return sequence(
    chooseCardsForAction(isHero, commitToQuest),
    playerActions("Reveal encounter cards"),
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
      const actions = cards.map((id) => ({
        label: id.toString(),
        value: factory(id),
        image: view.cards.find((c) => c.id === id)!.props.image,
      }));
      await engine.chooseNextActions("Choose cards", actions);
    },
    commands: (s) => {
      const view = createView(s);
      const cards = filterCards(filter, view);
      const actions = cards.map((id) => factory(id)).filter((a) => getActionResult(a, s) !== "none");
      const combinations = [...PowerSet.of(actions)] as Action[][];
      return combinations.flatMap((list) => sequence(...list).commands(s));
    },
  };
}

export function chooseCardForAction(filter: Filter<CardId>, factory: (id: CardId) => Action): Action {
  return {
    print: `choose card for action: [${factory(0).print}]`,
    do: async (engine) => {
      const view = createView(engine.state);
      const cards = filterCards(filter, view);
      const actions = cards.map((id) => ({
        label: id.toString(),
        value: factory(id),
        image: view.cards.find((c) => c.id === id)!.props.image,
      }));
      await engine.chooseNextAction("Choose card", actions);
    },
    commands: (s) => {
      const view = createView(s);
      const cards = filterCards(filter, view);
      const actions = cards.map((id) => factory(id)).filter((a) => getActionResult(a, s) !== "none");
      const commands = actions.flatMap((action) => action.commands(s));
      return commands;
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
    ifThen(negate(isThereActiveLocation), chooseCardForAction(isLocation, travelToLocation)),
    playerActions("Next")
  );
}

export function travelToLocation(cardId: CardId): Action {
  return action(moveCard(cardId, zoneKey("stagingArea"), zoneKey("activeLocation"), "face"));
}
