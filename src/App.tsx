import React, { useContext, useState } from "react";
import { Card, createInitState } from "./engine/state";
import { createView } from "./engine/view";
import { choosePlayerForAct, drawCard, GameShow, sequence } from "./components/GameShow";
import { gimli, gloin, legolas, thalin } from "./cards/sets/core/heroes";
import { DialogsContext } from "./components/DialogsContext";
import { Dialog, DialogContent, DialogTitle, List, ListItem } from "@material-ui/core";
import { Engine } from "./engine/types";

function createEngine(): Engine {
  
}

function App() {
  const [state, setState] = useState(createInitState({ cards: [gimli, legolas] }, { cards: [thalin] }));
  const view = createView(state);

  //console.log(JSON.stringify(view, null, 1));
  //console.log(JSON.stringify(state, null, 1));

  const dialog = useContext(DialogsContext);

  // const action = sequence(
  //   choosePlayerForAct(0, (id) => sequence(drawCard(id), drawCard(id))),
  //   choosePlayerForAct(0, (id) => sequence(drawCard(id), drawCard(id)))
  // );

  // console.log("action", action.print);
  // console.log("choices", action.choices(state));
  // console.log("results", action.results(state));
  // console.log("commands", action.commands(state));

  const engine: Engine = {
    exec: (cmd) => {
      console.log("exec", cmd.print);
      setState(cmd.do(state)[0]);
    },
    do: async (action) => {
      action.do(engine);
    },
    choosePlayer: async (chooser) => {
      return await dialog.openDialog<number>((dp) => (
        <Dialog open={dp.open}>
          <DialogTitle>Choose player</DialogTitle>
          <DialogContent>
            <List>
              {state.players.map((p) => (
                <ListItem
                  button
                  key={p.id}
                  onClick={() => {
                    dp.onSubmit(p.id);
                  }}
                  style={{ width: "auto" }}
                >
                  {p.id}
                </ListItem>
              ))}
            </List>
          </DialogContent>
        </Dialog>
      ));
    },
  };

  return (
    <>
      {/* <CardShow card={view.cards[0]} content="text" /> */}
      {/* <ZoneShow type="hand" owner={1} view={view} /> */}
      {/* <PlayerShow player={view.players[0]} view={view} /> */}
      <GameShow
        view={view}
        onAction={async (action) => {
          console.log(action.print);
          engine.do(action);
        }}
      />
      {/* <CardShow card={view.cards[0]} content="image" /> */}
    </>
  );
}

export default App;
