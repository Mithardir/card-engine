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
import React, { useContext, createContext, useState } from "react";
import { Engine, UI } from "../engine/engine";
import { DialogsContextProps } from "./DialogsContext";

const EngineContext = createContext<Engine>(undefined as any);

export const EngineProvider = (props: React.PropsWithChildren<{ engine: Engine }>) => {
  return <EngineContext.Provider value={props.engine}>{props.children}</EngineContext.Provider>;
};

export const useEngine = () => useContext(EngineContext);

const scale = 0.4;
const width = 430 * scale;
const height = 600 * scale;

export const reactUI: (dialog: DialogsContextProps) => UI = (dialog) => {
  return {
    chooseOne: async (title, items) => {
      console.log(title, items);
      return await dialog.openDialog((dp) => (
        <Dialog open={dp.open} maxWidth="md">
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
                      dp.onSubmit(a.value);
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
      ));
    },
    chooseMultiple: async (title, items) => {
      return await dialog.openDialog((dp) => {
        const [selected, setSelected] = useState<any[]>([]);
        return (
          <Dialog open={dp.open} maxWidth="md">
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
                      const filtered = selected.includes(o.value)
                        ? selected.filter((s) => s !== o.value)
                        : [...selected, o.value];

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
                        opacity: selected.includes(o.value) ? 1 : 0.5,
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  dp.onSubmit(selected);
                }}
              >
                Confirm
              </Button>
            </DialogActions>
          </Dialog>
        );
      });
    },
    playerActions: async (title) => {
      console.log(title);
      return await dialog.openDialog((dp) => (
        <Fab
          color="primary"
          variant="extended"
          style={{ position: "fixed", right: 8, bottom: 8 }}
          onClick={() => dp.onSubmit()}
        >
          <Icon>skip_next</Icon>
          {title}
        </Fab>
      ));
    },
  };
};
