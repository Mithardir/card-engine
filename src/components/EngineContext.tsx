import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  Fab,
  Icon,
  Button,
  DialogActions,
  Grid,
} from "@material-ui/core";
import { observer } from "mobx-react-lite";
import React, { useContext, createContext, useState } from "react";
import { sequence } from "../engine/actions/control";
import { Engine } from "../engine/engine";

const EngineContext = createContext<Engine>(undefined as any);

export const EngineProvider = (
  props: React.PropsWithChildren<{ engine: Engine }>
) => {
  return (
    <EngineContext.Provider value={props.engine}>
      {props.children}
    </EngineContext.Provider>
  );
};

export const useEngine = () => useContext(EngineContext);

const scale = 0.4;
const width = 430 * scale;
const height = 600 * scale;

export const GameDialogs = observer(() => {
  const engine = useEngine();
  const [selected, setSelected] = useState<any[]>([]);

  if (
    engine.result?.choice?.dialog &&
    engine.result?.choice?.multiple === false
  ) {
    const title = engine.result.choice.title;
    const items = engine.result.choice.choices;
    return (
      <Dialog open={true} maxWidth="md">
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <List
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-evenly",
            }}
          >
            {items.map((a, i) => (
              <Grid key={i} item xs={!a.image ? 12 : undefined}>
                <ListItem
                  button
                  key={a.label}
                  onClick={() => {
                    //engine.do(a.action);
                    engine.do(
                      sequence(a.action, engine.result?.next || sequence()),
                      false
                    );
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
  }

  if (
    engine.result?.choice?.dialog &&
    engine.result?.choice?.multiple === true
  ) {
    const title = engine.result.choice.title;
    const items = engine.result.choice.choices;
    return (
      <Dialog open={true} maxWidth="md">
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <List
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-evenly",
            }}
          >
            {items.map((o, i) => (
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
              engine.do(
                sequence(...selected, engine.result?.next || sequence()),
                false
              );
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  if (engine.result?.choice && !engine.result.choice.dialog) {
    return (
      <Fab
        color="primary"
        variant="extended"
        style={{ position: "fixed", right: 8, bottom: 8 }}
        onClick={() => {
          // engine.do(
          //   engine.result!.choice!.choices[
          //     engine.result!.choice!.choices.length - 1
          //   ].action
          // );

          if (engine.result?.next) {
            engine.do(engine.result.next, true);
          }
        }}
      >
        <Icon>skip_next</Icon>
        {engine.result.choice.title}
      </Fab>
    );
  }

  return <></>;
});
