import { Paper, Typography } from "@material-ui/core";
import produce from "immer";
import * as React from "react";
import { moveTopCard } from "../engine/commands";
import { GameZoneType, PlayerId, PlayerZoneType, Side, State, ZoneState } from "../engine/state";
import { Action, Command, CommandResult } from "../engine/types";
import { View } from "../engine/view";
import { PlayerShow } from "./PlayerShow";
import { ZoneShow } from "./ZoneShow";

export type ZoneKey = { type: GameZoneType; player?: never } | { type: PlayerZoneType; player: PlayerId };

export function getZone(key: ZoneKey): (state: State) => ZoneState {
  return (v) => {
    if (key.player) {
      const player = v.players.find((p) => p.id === key.player);
      if (player) {
        return player.zones[key.type];
      }
    } else {
      return (v.zones as any)[key.type];
    }
  };
}

export const drawCard: (player: PlayerId) => Action = (player) => {
  return simpleAction(
    moveTopCard({ type: "library", player }, { type: "hand", player }, "face"),
    `drawCard(player: ${player})`
  );
};

export function simpleAction(cmd: Command, print?: string): Action {
  return {
    print: print ?? cmd.print,
    do: async (e) => e.exec(cmd),
    results: (s) => [[cmd.do(s), cmd.result(s)]],
    result: (s) => cmd.result(s),
    choices: (s) => [cmd.do(s)],
    commands: () => [{ first: cmd, next: [] }],
  };
}

export function sequence(...actions: Action[]): Action {
  return {
    print: `sequence(${actions.map((a) => a.print).join(", ")})`,
    do: async (engine) => {
      for (const act of actions) {
        await engine.do(act);
      }
    },
    result: (init) => {
      return "partial";
    },
    results: (init) => {
      let res = actions[0].results(init);

      for (const act of actions.slice(1)) {
        const next = res.flatMap((r) => act.results(r[0]));
        res = next;
      }

      return res;
    },
    choices: (init) => {
      let res = actions[0].results(init);

      for (const act of actions.slice(1)) {
        const next = res.flatMap((r) => act.results(r[0]));
        res = next;
      }

      return res.map((r) => r[0]);
    },
    commands: (s) => {
      if (actions[0] === undefined) {
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
    print: `choosePlayerForAct(${player}, ${factory(0).print})`,
    do: async (engine) => {
      const actions = engine.state.players.map((p) => ({ label: p.id.toString(), action: factory(p.id) }));
      await engine.chooseNextAction("Choose player", actions);
    },
    result: (s) => mergeOrResults(s.players.map((p) => factory(p.id).result(s))),
    results: (s) => s.players.flatMap((p) => factory(p.id).results(s)),
    choices: (s) => s.players.flatMap((p) => factory(p.id).choices(s)),
    commands: (s) => {
      return s.players.flatMap((p) => factory(p.id).commands(s));
    },
  };
}

export function mergeOrResults(results: CommandResult[]): CommandResult {
  if (results.some((c) => c === "full")) {
    return "full";
  }

  if (results.every((c) => c === "none")) {
    return "none";
  }

  return "partial";
}

export function mergeAndResults(...results: CommandResult[]): CommandResult {
  if (results.every((c) => c === "full")) {
    return "full";
  }

  if (results.every((c) => c === "none")) {
    return "none";
  }

  return "partial";
}

export const GameShow = (props: { view: View; onAction: (action: Action) => void }) => {
  return (
    <div style={{ display: "flex" }}>
      <div style={{}}>
        <div
          style={{
            border: "1px solid black",
            flexShrink: 0,
            width: 215,
            height: 320,
            margin: 3,
          }}
        >
          {/* {false ? (
            <CardShow
              cardId={props.game.detailCard.id}
              content="text"
              scale={0.5}
              style={{
                margin: 0,
                border: undefined,
                marginTop: 0,
                marginLeft: 0,
              }}
            />
          ) : (
            <Paper style={{}} />
          )} */}
          <Paper style={{}} />
        </div>
        <Paper style={{ margin: 3 }}>
          {/* <Typography>First player: {game.view.firstPlayerId}</Typography>
          <Typography>Phase: {game.view.phase.type}</Typography> */}
        </Paper>
        <Paper>
          <Typography>Effects:</Typography>
          {/* {game.view.effects.map((e, index) => (
            <Typography key={index}>{e.modifier.print()}</Typography>
          ))} */}
        </Paper>

        <button
          onClick={() => {
            const action = sequence(
              choosePlayerForAct(0, (id) => sequence(drawCard(id), drawCard(id))),
              choosePlayerForAct(0, (id) => drawCard(id)),
              choosePlayerForAct(0, (id) => drawCard(id)),
              choosePlayerForAct(0, (id) => drawCard(id))
            );

            props.onAction(action);
          }}
        >
          Draw card
        </button>
        {/* {game.saves.length > 0 && (
          <>
            <Button
              onClick={() => {
                game.resetPhase();
              }}
            >
              Reset step
            </Button>
          </>
        )} */}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
          minHeight: "100vh",
        }}
      >
        <div style={{ display: "flex", flexDirection: "row" }}>
          <ZoneShow type="discardPile" view={props.view} />
          <ZoneShow type="encounterDeck" view={props.view} />
          <ZoneShow type="quest" view={props.view} />
          <ZoneShow type="activeLocation" view={props.view} />
          <ZoneShow type="stagingArea" view={props.view} />
        </div>
        <div style={{ display: "flex" }}>
          {props.view.players.map((p) => (
            <PlayerShow player={p} key={p.id} view={props.view} />
          ))}
        </div>

        {/* <ChoiceDialog /> */}
        {/* {game.view.playerActions && (
          <Fab
            color="primary"
            variant="extended"
            style={{ position: "fixed", right: 8, bottom: 8 }}
            onClick={(e) =>
              game.view.playerActions && game.view.playerActions.end()
            }
          >
            <Icon>skip_next</Icon>
            {game.view.playerActions.title}
          </Fab>
        )} */}
      </div>
    </div>
  );
};
