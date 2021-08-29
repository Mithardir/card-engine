import { Button, Paper, Typography } from "@material-ui/core";
import * as React from "react";
import { CardShow } from "./CardShow";
import { DetailContext } from "./DetailContext";
import { PlayerShow } from "./PlayerShow";
import { ZoneShow } from "./ZoneShow";
import { coreTactics, passageThroughMirkwood } from "../engine/setup";
import { sequence } from "../engine/actions/control";
import { playerActions } from "../engine/actions/game";
import { beginScenario } from "../engine/actions/phases";
import { observer } from "mobx-react-lite";
import { Engine } from "../engine/engine";
import { values } from "lodash";

export const GameShow = observer((props: { engine: Engine }) => {
  const detail = React.useContext(DetailContext);
  const view = props.engine.state.view;
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
              card={view.cards.find((c) => c.id === detail.cardId)!}
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
          <Typography>First player: {view.firstPlayer}</Typography>
          <Typography>Phase: {view.phase}</Typography>
        </Paper>
        <Paper style={{ margin: 4 }}>
          <Typography>Effects:</Typography>
          {/* {game.view.effects.map((e, index) => (
            <Typography key={index}>{e.modifier.print()}</Typography>
          ))} */}
        </Paper>

        <Button
          onClick={() => {
            props.engine.do(beginScenario(passageThroughMirkwood, coreTactics));
          }}
        >
          Start game
        </Button>

        <Button
          onClick={() => {
            // const action = chooseOne2("choose one", [draw2(1)("A"), draw2(1)("B"), draw2(2)("A"), draw2(2)("B")]);
            // props.onAction2(sequence2(action, action));

            props.engine.do(
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
          <ZoneShow type="discardPile" view={view} />
          <ZoneShow type="encounterDeck" view={view} />
          <ZoneShow type="quest" view={view} />
          <ZoneShow type="activeLocation" view={view} />
          <ZoneShow type="stagingArea" view={view} />
        </div>
        <div style={{ display: "flex" }}>
          {values(view.players).map((p) => (
            <PlayerShow player={p} key={p.id} view={view} />
          ))}
        </div>
      </div>
    </div>
  );
});
