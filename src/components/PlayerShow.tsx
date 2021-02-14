import { Divider, Paper } from "@material-ui/core";
import * as React from "react";
import { PlayerState } from "../engine/state";
import { View } from "../engine/view";
import { ZoneShow } from "./ZoneShow";

export const PlayerShow = (props: { player: PlayerState; view: View }) => {
  return (
    <Paper style={{ border: "solid 1px black", margin: 4 }}>
      <div style={{ margin: 2 }}>
        Player: {props.player.id} (Threat: {props.player.thread})
      </div>
      <Divider />
      <ZoneShow type="engaged" owner={props.player.id} view={props.view} />
      <ZoneShow type="playerArea" owner={props.player.id} view={props.view} />
      <div style={{ display: "flex" }}>
        <ZoneShow type="hand" owner={props.player.id} view={props.view} />
        <ZoneShow type="library" owner={props.player.id} view={props.view} />
        <ZoneShow type="discardPile" owner={props.player.id} view={props.view} />
      </div>
    </Paper>
  );
};
