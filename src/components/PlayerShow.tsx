import { Divider, Paper } from "@mui/material";
import { PlayerState, State, View } from "../types/state";
import { ZoneShow } from "./ZoneShow";

export const PlayerShow = (props: {
  player: PlayerState;
  state: State;
  view: View;
}) => {
  return (
    <Paper style={{ border: "solid 1px black", margin: 4 }}>
      <div style={{ margin: 2 }}>
        Player: {props.player.id} (Threat: {props.player.thread})
      </div>
      <Divider />
      <ZoneShow
        type="engaged"
        owner={props.player.id}
        state={props.state}
        view={props.view}
      />
      <ZoneShow
        type="playerArea"
        owner={props.player.id}
        state={props.state}
        view={props.view}
      />
      <div style={{ display: "flex" }}>
        <ZoneShow
          type="hand"
          owner={props.player.id}
          state={props.state}
          view={props.view}
          showAttachments
        />
        <ZoneShow
          type="library"
          owner={props.player.id}
          state={props.state}
          view={props.view}
        />
        <ZoneShow
          type="discardPile"
          owner={props.player.id}
          state={props.state}
          view={props.view}
        />
      </div>
    </Paper>
  );
};
