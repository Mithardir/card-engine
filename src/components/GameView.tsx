import { Paper, Typography } from "@mui/material";
import produce from "immer";
import { useContext, useMemo, useState } from "react";
import { coreTactics, passageThroughMirkwood } from "../engine/setup";
import { values } from "lodash";
import { DetailContext } from "./DetailContext";
import { PlayerShow } from "./PlayerShow";
import { ZoneShow } from "./ZoneShow";
import { NextStepButton } from "./NextStepButton";
import { CardShow } from "./CardShow";
import { ChooseSingleDialog } from "./ChooseSingleDialog";
import { ChooseMultipleDialog } from "./ChooseMultipleDialog";
import { sequence } from "../engine/actions/global";
import { beginScenario } from "../engine/actions/round";
import { toView, nextStep } from "../engine/engine";
import { State } from "../types/state";
import { StateContext } from "./StateContext";

export const GameView = (props: {}) => {
  const detail = useContext(DetailContext);
  const { state, setState } = useContext(StateContext);
  const view = useMemo(() => toView(state), [state]);

  return (
    <div style={{ display: "flex", backgroundColor: "#33eaff" }}>
      <div style={{ backgroundColor: "#5393ff", width: 330, flexShrink: 0 }}>
        <Paper
          style={{
            height: 450,
            margin: 4,
          }}
        >
          {detail.cardId && (
            <CardShow
              state={state.cards[detail.cardId]}
              view={view.cards[detail.cardId]}
              content="text"
              scale={0.75}
              style={{
                margin: 0,
                border: "initial",
                marginTop: 0,
                marginLeft: 0,
              }}
            />
          )}
        </Paper>
        <Paper style={{ margin: 4 }}>
          {/* <Typography>First player: {state.firstPlayer}</Typography> */}
          <Typography>Phase: {state.phase}</Typography>
        </Paper>
        <Paper style={{ margin: 4 }}>
          <Typography>Effects:</Typography>
          {/* {game.view.effects.map((e, index) => (
        <Typography key={index}>{e.modifier.print()}</Typography>
      ))} */}
        </Paper>

        {/* <Button
          onClick={() => {
            props.engine.do(beginScenario(passageThroughMirkwood, coreTactics));
          }}
        >
          Start game
        </Button> */}

        {state.choice && (
          <Paper style={{ margin: 4 }}>
            <Typography>Choice: {state.choice.title}</Typography>
            <Typography>Options: </Typography>
            <ul>
              {state.choice.options.map((c, i) => (
                <li key={i}>{c.title}</li>
              ))}
            </ul>
          </Paper>
        )}

        {JSON.stringify(state.next[0]?.print, null, 1)}

        {state.choice && state.choice.dialog && !state.choice.multi && (
          <>
            <ChooseSingleDialog
              title={state.choice.title}
              choices={state.choice.options}
              onChoice={(action) => {
                const newState = produce(state, (draft) => {
                  draft.choice = undefined;
                  action.apply(draft);
                  advanceToChoiceState(draft);
                });

                setState(newState);
              }}
            />
          </>
        )}

        {state.choice && state.choice.dialog && state.choice.multi && (
          <>
            <ChooseMultipleDialog
              title={state.choice.title}
              choices={state.choice.options}
              onChoices={(actions) => {
                const newState = produce(state, (draft) => {
                  draft.choice = undefined;
                  sequence(...actions).apply(draft);
                  advanceToChoiceState(draft);
                });

                setState(newState);
              }}
            />
          </>
        )}

        <NextStepButton state={state} setState={setState} />
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
          <ZoneShow type="stagingArea" state={state} view={view} />
          <ZoneShow type="activeLocation" state={state} view={view} />
          <ZoneShow type="questDeck" state={state} view={view} />
          <ZoneShow type="encounterDeck" state={state} view={view} />
          <ZoneShow type="discardPile" state={state} view={view} />
        </div>
        <div style={{ display: "flex" }}>
          {values(state.players).map((p) => (
            <PlayerShow player={p} key={p.id} state={state} view={view} />
          ))}
        </div>
      </div>
    </div>
  );
};

export function advanceToChoiceState(state: State) {
  while (true) {
    if (state.next.length === 0) {
      return;
    }

    if (state.choice) {
      return state;
      // if (state.choice.options.length > 1) {
      //   return state;
      // }

      // if (state.choice.options.length === 1) {
      //   console.log("Auto choosing: ", state.choice.options[0].title);
      //   state.next = [state.choice.options[0].action, ...state.next];
      //   state.choice = undefined;
      // }
    }

    nextStep(state);
  }
}
