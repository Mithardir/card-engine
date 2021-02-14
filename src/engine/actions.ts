import { addPlayer, batch, moveTopCard, repeat, setupScenario, shuffleZone, zoneKey } from "./commands";
import { Scenario, PlayerDeck } from "./setup";
import { PlayerId, playerIds } from "./state";
import { Action, Command, PlayerAction } from "./types";

export const draw: (amount: number) => PlayerAction = (amount) => (player) => {
  return action(
    repeat(amount, moveTopCard(zoneKey("library", player), zoneKey("hand", player), "face")),
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
        return [];
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

export function eachPlayer(factory: (id: PlayerId) => Action): Action {
  return {
    print: `each player: ${factory("X").print}`,
    do: async (engine) => {
      const action = sequence(...engine.state.players.map((p) => factory(p.id)));
      action.do(engine);
    },
    commands: (s) => sequence(...s.players.map((p) => factory(p.id))).commands(s),
  };
}

export function phaseResource(): Action {
  return sequence(eachPlayer(draw(1)));
}
