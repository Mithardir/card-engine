import { addPlayer, moveTopCard, repeat, setupScenario, zoneKey } from "./commands";
import { Scenario, PlayerDeck } from "./setup";
import { PlayerId } from "./state";
import { Action, Command } from "./types";

export const drawCard: (player: PlayerId, amount: number) => Action = (player, amount) => {
  return simpleAction(
    repeat(amount, moveTopCard(zoneKey("library", player), zoneKey("hand", player), "face")),
    `player ${player} draws ${amount} cards`
  );
};

export function simpleAction(cmd: Command, print?: string): Action {
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
  do: async (e) => {},
  commands: () => [],
};

export function beginScenario(scenario: Scenario, ...decks: PlayerDeck[]): Action {
  return sequence(
    simpleAction(setupScenario(scenario)),
    simpleAction(addPlayer("A", decks[0])),
    simpleAction(addPlayer("B", decks[1]))
  );
}
