import { Paper, Typography } from "@material-ui/core";
import produce from "immer";
import * as React from "react";
import { GameZoneType, PlayerId, PlayerZoneType, Side, State, ZoneState, ZoneType } from "../engine/state";
import { Action, Command, CommandResult, Tree } from "../engine/types";
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

function moveTopCard(from: ZoneKey, to: ZoneKey, side: Side): Command {
  return {
    print: `moveTopCard(from:${JSON.stringify(from)}, to:${JSON.stringify(from)}, side:${side})`,
    do: (s) => {
      let change: CommandResult = "none";
      return [
        produce(s, (draft) => {
          const fromZone = getZone(from)(draft);
          const toZone = getZone(to)(draft);

          if (fromZone.cards.length > 0) {
            const cardId = fromZone.cards.pop()!;
            const card = draft.cards.find((c) => c.id === cardId)!;
            card.sideUp = side;
            toZone.cards.push(cardId);
            change = "full";
          }
        }),
        change,
      ];
    },
  };
}

const drawCard: (player: PlayerId) => Action = (player) => {
  return simpleAction(moveTopCard({ type: "library", player }, { type: "hand", player }, "face"));
};

function simpleAction(cmd: Command): Action {
  return {
    print: cmd.print,
    do: async (s) => cmd.do(s)[0],
    choices: { item: cmd },
    simulate: (s) => [cmd.do(s)],
  };
}

function joinTrees<T>(tree1: Tree<T>, tree2: Tree<T>): Tree<T> {
  if (tree1.children && tree1.children.length === 0) {
    return tree2;
  }

  throw new Error();
}

function sequence(...actions: Action[]): Action {
  return {
    print: `sequence(${actions.map((a) => a.print).join(", ")})`,
    do: async (init) => {
      let state = init;
      for (const act of actions) {
        state = await act.do(state);
      }
      return state;
    },
    get choices() {
      let tree: Tree<Command> = { children: [] };

      for (const act of actions) {
        tree = joinTrees(tree, act.choices);
      }

      return tree;
    },
    simulate: (init) => {
      let possibles: [State, CommandResult][] = [[init, "full"]];
      for (const act of actions) {
        possibles = possibles.flatMap((p) => act.simulate(p[0]));
      }
      return possibles;
    },
  };
}

function batch(...cmds: Command[]): Command {
  return {
    print: `batch(${cmds.map((c) => c.print).join(", ")})`,
    do: (init) => {
      let state = init;
      const results: CommandResult[] = [];
      for (const cmd of cmds) {
        const result = cmd.do(state);
        state = result[0];
        results.push(result[1]);
      }

      return [state, mergeCommandResults(results)];
    },
  };
}

export function mergeCommandResults(results: CommandResult[]): CommandResult {
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
            props.onAction(sequence(drawCard(2), drawCard(5)));
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
