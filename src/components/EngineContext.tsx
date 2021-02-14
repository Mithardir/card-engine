import { Dialog, DialogTitle, DialogContent, List, ListItem, Fab, Icon } from "@material-ui/core";
import React, { useContext, createContext } from "react";
import { UI } from "../engine/engine";
import { Engine } from "../engine/types";
import { DialogsContextProps } from "./DialogsContext";

const EngineContext = createContext<Engine>(undefined as any);

export const EngineProvider = (props: React.PropsWithChildren<{ engine: Engine }>) => {
  return <EngineContext.Provider value={props.engine}>{props.children}</EngineContext.Provider>;
};

export const useEngine = () => useContext(EngineContext);

export const reactUI: (dialog: DialogsContextProps) => UI = (dialog) => {
  return {
    chooseOne: async (title, items) => {
      return await dialog.openDialog((dp) => (
        <Dialog open={dp.open}>
          <DialogTitle>{title}</DialogTitle>
          <DialogContent>
            <List>
              {items.map((a) => (
                <ListItem
                  button
                  key={a.label}
                  onClick={() => {
                    dp.onSubmit(a.value);
                  }}
                  style={{ width: "auto" }}
                >
                  {a.label}
                </ListItem>
              ))}
            </List>
          </DialogContent>
        </Dialog>
      ));
    },
    playerActions: async (title) => {
      return await dialog.openDialog((dp) => (
        <Fab
          color="primary"
          variant="extended"
          style={{ position: "fixed", right: 8, bottom: 8 }}
          onClick={(e) => dp.onSubmit()}
        >
          <Icon>skip_next</Icon>
          {title}
        </Fab>
      ));
    },
  };
};
