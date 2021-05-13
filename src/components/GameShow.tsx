import { Button, Paper, Typography } from "@material-ui/core";
import * as React from "react";
import { View } from "../engine/view";
import { CardShow } from "./CardShow";
import { DetailContext } from "./DetailContext";
import { PlayerShow } from "./PlayerShow";
import { ZoneShow } from "./ZoneShow";
import { coreTactics, passageThroughMirkwood } from "../engine/setup";
import { Action } from "../engine/actions/types";
import { sequence } from "../engine/actions/control";
import { playerActions } from "../engine/actions/game";
import { beginScenario } from "../engine/actions/phases";

export const GameShow = (props: { view: View; onAction: (action: Action) => void }) => {
  const detail = React.useContext(DetailContext);
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
          <Typography>First player: {props.view.firstPlayer}</Typography>
          <Typography>Phase: {props.view.phase}</Typography>
        </Paper>
        <Paper style={{ margin: 4 }}>
          <Typography>Effects:</Typography>
          {/* {game.view.effects.map((e, index) => (
            <Typography key={index}>{e.modifier.print()}</Typography>
          ))} */}
        </Paper>

        <Button
          onClick={() => {
            props.onAction(beginScenario(passageThroughMirkwood, coreTactics));
          }}
        >
          Start game
        </Button>

        <Button
          onClick={() => {
            // const action = chooseOne2("choose one", [draw2(1)("A"), draw2(1)("B"), draw2(2)("A"), draw2(2)("B")]);
            // props.onAction2(sequence2(action, action));

            props.onAction(
              sequence(
                playerActions("A"),
                playerActions("B"),
                playerActions("C"),
                playerActions("D"),
                playerActions("E")
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
