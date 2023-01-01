import { Paper, Typography } from "@mui/material";
import { useContext, useMemo } from "react";
import { values } from "lodash";
import { DetailContext } from "./DetailContext";
import { PlayerShow } from "./PlayerShow";
import { ZoneShow } from "./ZoneShow";
import { NextStepButton } from "./NextStepButton";
import { CardShow } from "./CardShow";
import { StateContext } from "./StateContext";
import { toView } from "../engine/view";
import { ChooseSingleDialog } from "./ChooseSingleDialog";
import { ChooseMultipleDialog } from "./ChooseMultipleDialog";
import { advanceToChoiceState } from "../engine/basic";
import produce from "immer";
import { sequence } from "../factories/actions";

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
          {/* {state.effects.map((e, index) => (
            <Typography key={index}>{e.description}</Typography>
          ))} */}
        </Paper>

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

        <div style={{ overflow: "auto", height: 250 }}>
          {state.next.map((a, i) => (
            <ul key={i}>
              <li>{JSON.stringify(a, null, 1)}</li>
            </ul>
          ))}
        </div>

        {state.choice && state.choice.dialog && !state.choice.multi && (
          <>
            <ChooseSingleDialog
              title={state.choice.title}
              choices={state.choice.options}
              onChoice={(action) => {
                const newState = produce(state, (draft) => {
                  draft.choice = undefined;
                  draft.next.unshift(action);
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
                  draft.next.unshift(sequence(...actions));
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
