import { Button, Paper, Typography } from "@material-ui/core";
import * as React from "react";
import { Action } from "../engine/types";
import { View } from "../engine/view";
import { CardShow } from "./CardShow";
import { DetailContext } from "./DetailContext";
import {
  sequence,
  choosePlayerForAct,
  beginScenario,
  draw,
  phaseQuest,
  startGame,
  beginScenario2,
} from "../engine/actions";
import { PlayerShow } from "./PlayerShow";
import { ZoneShow } from "./ZoneShow";
import { coreTactics, passageThroughMirkwood } from "../engine/setup";
import { useEngine } from "./EngineContext";
import { Action2, chooseOne2, draw2, playerActions2, sequence2 } from "../engine/actions2";

export const GameShow = (props: {
  view: View;
  onAction: (action: Action) => void;
  onAction2: (action: Action2) => void;
}) => {
  const detail = React.useContext(DetailContext);
  const engine = useEngine();
  return (
    <div style={{ display: "flex", backgroundColor: "#33eaff" }}>
      <div style={{ backgroundColor: "#5393ff", width: 215 }}>
        <Paper
          style={{
            height: 320,
            margin: 4,
          }}
        >
          {detail.cardId && (
            <CardShow
              card={props.view.cards.find((c) => c.id === detail.cardId)!}
              content="text"
              scale={0.5}
              style={{
                margin: 0,
                border: undefined,
                marginTop: 0,
                marginLeft: 0,
              }}
            />
          )}
        </Paper>
        <Paper style={{ margin: 4 }}>
          {/* <Typography>First player: {game.view.firstPlayerId}</Typography>
          <Typography>Phase: {game.view.phase.type}</Typography> */}
        </Paper>
        <Paper style={{ margin: 4 }}>
          <Typography>Effects:</Typography>
          {/* {game.view.effects.map((e, index) => (
            <Typography key={index}>{e.modifier.print()}</Typography>
          ))} */}
        </Paper>

        <Button
          onClick={() => {
            props.onAction2(beginScenario2(passageThroughMirkwood, coreTactics));
          }}
        >
          Start game
        </Button>

        <Button
          onClick={() => {
            // const action = chooseOne2("choose one", [draw2(1)("A"), draw2(1)("B"), draw2(2)("A"), draw2(2)("B")]);
            // props.onAction2(sequence2(action, action));

            props.onAction2(
              sequence2(
                playerActions2("A"),
                playerActions2("B"),
                playerActions2("C"),
                playerActions2("D"),
                playerActions2("E")
              )
            );
          }}
        >
          Draw cards
        </Button>
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
      </div>
    </div>
  );
};
