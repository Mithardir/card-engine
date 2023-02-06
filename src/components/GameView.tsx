import { Alert, Paper, Snackbar, Typography } from "@mui/material";
import { useContext, useMemo, useState } from "react";
import { values } from "lodash";
import { DetailContext } from "./DetailContext";
import { PlayerShow } from "./PlayerShow";
import { ZoneShow } from "./ZoneShow";
import { NextStepButton } from "./NextStepButton";
import { CardShow } from "./CardShow";
import { StateContext } from "./StateContext";
import { toView } from "../engine/view/toView";
import { ChooseSingleDialog } from "./ChooseSingleDialog";
import { ChooseMultipleDialog } from "./ChooseMultipleDialog";
import { advanceToChoiceState } from "../engine/updates/advanceToChoiceState";
import produce from "immer";
import { sequence } from "../factories/actions";

export const GameView = (props: {}) => {
  const detail = useContext(DetailContext);
  const { state, setState } = useContext(StateContext);
  const view = useMemo(() => toView(state), [state]);
  const [error, setError] = useState("");

  return (
    <div style={{ display: "flex", backgroundColor: "#33eaff" }}>
      {error && (
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError("")}
        >
          <Alert onClose={() => setError("")} severity="error">
            {error}
          </Alert>
        </Snackbar>
      )}
      <div style={{ backgroundColor: "#5393ff", width: 330, flexShrink: 0 }}>
        <Paper
          style={{
            height: 450,
            margin: 4,
          }}
        >
          {detail.cardId && (
            <CardShow
              setError={setError}
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
          {/* TODO <Typography>First player: {state.firstPlayer}</Typography>  */}
          <Typography>Phase: {state.phase}</Typography>
        </Paper>
        <Paper style={{ margin: 4 }}>
          <Typography>Effects:</Typography>
          {/* TODO {state.effects.map((e, index) => (
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
                  advanceToChoiceState(draft, setError);
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
                  advanceToChoiceState(draft, setError);
                });

                setState(newState);
              }}
            />
          </>
        )}

        <NextStepButton setError={setError} />
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
          <ZoneShow type="stagingArea" setError={setError} />
          <ZoneShow type="activeLocation" setError={setError} />
          <ZoneShow type="questDeck" setError={setError} />
          <ZoneShow type="encounterDeck" setError={setError} />
          <ZoneShow type="discardPile" setError={setError} />
        </div>
        <div style={{ display: "flex" }}>
          {values(state.players).map((p) => (
            <PlayerShow setError={setError} player={p} key={p.id} />
          ))}
        </div>
      </div>
    </div>
  );
};
