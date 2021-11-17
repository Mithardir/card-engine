import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  Grid,
  Icon,
  List,
  ListItem,
  Paper,
  Typography,
} from "@material-ui/core";
import * as React from "react";
import { CardShow } from "./CardShow";
import { DetailContext } from "./DetailContext";
import { PlayerShow } from "./PlayerShow";
import { ZoneShow } from "./ZoneShow";
import { coreTactics, passageThroughMirkwood } from "../engine/setup";
import { sequence } from "../engine/actions/control";
import { playerActions } from "../engine/actions/game";
import { beginScenario, startGame } from "../engine/actions/phases";
import { observer } from "mobx-react-lite";
import { Engine } from "../engine/engine";
import { values } from "lodash";
import { isObservable } from "mobx";
import { Action } from "../engine/actions/types";
import { useState } from "react";

export const GameShow = observer((props: { engine: Engine }) => {
  const detail = React.useContext(DetailContext);
  const view = props.engine.state.view;
  return (
    <div style={{ display: "flex", backgroundColor: "#33eaff" }}>
      <div style={{ backgroundColor: "#5393ff", width: 500 }}>
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
                border: "initial",
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
            props.engine.do2(
              beginScenario(passageThroughMirkwood, coreTactics)
            );
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

        {props.engine.choice && (
          <Paper style={{ margin: 4 }}>
            <Typography>Choice: {props.engine.choice.title}</Typography>
            <Typography>
              Options:{" "}
              <ul>
                {props.engine.choice.choices.map((c) => (
                  <li>{c.label}</li>
                ))}
              </ul>
            </Typography>
          </Paper>
        )}

        {JSON.stringify(props.engine.next?.print, null, 1)}

        {props.engine.choice?.dialog === false && (
          <Fab
            color="primary"
            variant="extended"
            style={{ position: "fixed", right: 8, bottom: 8 }}
            onClick={() => {
              props.engine.choice = undefined;
              if (props.engine.next) {
                props.engine.do2(props.engine.next);
              }
            }}
          >
            <Icon>skip_next</Icon>
            {props.engine.choice.title}
          </Fab>
        )}

        {props.engine.choice?.multiple === true && props.engine.choice.dialog && (
          <ChooseMultipleDialog
            title={props.engine.choice.title}
            choices={props.engine.choice.choices}
            onChoices={(actions) => {
              props.engine.choice = undefined;
              props.engine.do2(sequence(...actions));
              if (props.engine.next) {
                props.engine.do2(sequence(...actions, props.engine.next));
              } else {
                props.engine.do2(sequence(...actions));
              }
            }}
          />
        )}

        {props.engine.choice?.multiple === false && props.engine.choice.dialog && (
          <ChooseSingleDialog
            title={props.engine.choice.title}
            choices={props.engine.choice.choices}
            onChoice={(action) => {
              props.engine.choice = undefined;
              props.engine.do2(action);
              if (props.engine.next) {
                props.engine.do2(sequence(action, props.engine.next));
              } else {
                props.engine.do2(action);
              }
            }}
          />
        )}
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

export const ChooseMultipleDialog = (props: {
  title: string;
  choices: { label: string; image?: string | undefined; action: Action }[];
  onChoices: (actions: Action[]) => void;
}) => {
  const scale = 0.4;
  const width = 430 * scale;
  const height = 600 * scale;

  const [selected, setSelected] = useState<Action[]>([]);
  return (
    <Dialog open={true} maxWidth="md">
      <DialogTitle>{props.title}</DialogTitle>
      <DialogContent>
        <List
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-evenly",
          }}
        >
          {props.choices.map((o, i) => (
            <ListItem
              key={i}
              button={true}
              onClick={(e) => {
                e.stopPropagation();
                const filtered = selected.includes(o.action)
                  ? selected.filter((s) => s !== o.action)
                  : [...selected, o.action];

                setSelected(filtered);
              }}
              style={{ width: "auto" }}
            >
              <img
                alt={o.image}
                src={o.image}
                style={{
                  width,
                  height,
                  position: "relative",
                  opacity: selected.includes(o.action) ? 1 : 0.5,
                }}
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            props.onChoices(selected);
          }}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const ChooseSingleDialog = (props: {
  title: string;
  choices: { label: string; image?: string | undefined; action: Action }[];
  onChoice: (action: Action) => void;
}) => {
  const scale = 0.4;
  const width = 430 * scale;
  const height = 600 * scale;
  return (
    <Dialog open={true} maxWidth="md">
      <DialogTitle>{props.title}</DialogTitle>
      <DialogContent>
        <List
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-evenly",
          }}
        >
          {props.choices.map((a, i) => (
            <Grid key={i} item xs={!a.image ? 12 : "auto"}>
              <ListItem
                button
                key={a.label}
                onClick={() => {
                  props.onChoice(a.action);
                }}
                style={{ width: "auto" }}
              >
                {a.image ? (
                  <img
                    alt={a.image}
                    src={a.image}
                    style={{
                      width,
                      height,
                      position: "relative",
                    }}
                  />
                ) : (
                  a.label
                )}
              </ListItem>
            </Grid>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
};
