import * as React from "react";
import { PlayerState } from "../engine/state";
import { View } from "../engine/view";
import { ZoneShow } from "./ZoneShow";

export const PlayerShow = (props: { player: PlayerState; view: View }) => {
  return (
    <div style={{ border: "solid 1px black", margin: 5 }}>
      <div>
        Player: {props.player.id} (Threat: {props.player.thread})
      </div>
      <ZoneShow type="engaged" owner={props.player.id} view={props.view} />
      <ZoneShow type="playerArea" owner={props.player.id} view={props.view} />
      <div style={{ display: "flex" }}>
        <ZoneShow type="hand" owner={props.player.id} view={props.view} />
        <ZoneShow type="library" owner={props.player.id} view={props.view} />
        <ZoneShow
          type="discardPile"
          owner={props.player.id}
          view={props.view}
        />
      </div>
    </div>
  );
};
