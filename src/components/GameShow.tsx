import { Paper, Typography } from "@material-ui/core";
import * as React from "react";
import { Action } from "../engine/types";
import { View } from "../engine/view";
import { CardShow } from "./CardShow";
import { DetailContext } from "./DetailContext";
import { sequence, choosePlayerForAct, beginScenario, phaseResource, draw, phaseQuest } from "../engine/actions";
import { PlayerShow } from "./PlayerShow";
import { ZoneShow } from "./ZoneShow";
import { coreTactics, passageThroughMirkwood } from "../engine/setup";

export const GameShow = (props: { view: View; onAction: (action: Action) => void }) => {
  const detail = React.useContext(DetailContext);

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
          {detail.cardId ? (
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
          ) : (
            <Paper style={{}} />
          )}
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
            props.onAction(sequence(beginScenario(passageThroughMirkwood, coreTactics), phaseResource(), phaseQuest()));
          }}
        >
          Begin scenario
        </button>

        <button
          onClick={() => {
            const action = sequence(
              choosePlayerForAct("A", draw(2)),
              choosePlayerForAct("A", draw(1)),
              choosePlayerForAct("A", draw(1)),
              choosePlayerForAct("A", draw(1))
            );

            props.onAction(action);
          }}
        >
          Draw cards
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
      </div>
    </div>
  );
};
