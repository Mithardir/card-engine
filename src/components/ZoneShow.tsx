import { Divider, Paper } from "@material-ui/core";
import { values } from "lodash";
import * as React from "react";
import {
  GameZoneType,
  PlayerId,
  PlayerZoneType,
  ZoneState,
} from "../engine/state";
import { CardView, View } from "../engine/view";
import { CardShow } from "./CardShow";
import { useEngine } from "./EngineContext";

export const CardBox = (props: { card: CardView; attachments: CardView[] }) => {
  const cards = [...props.attachments, props.card];

  return (
    <div
      style={{
        justifyContent: "center",
        //display: "grid",
        //gridTemplateRows: "repeat(auto-fit,  25px)",
        // https://stackoverflow.com/a/53038326
        //height: 168 + 27 * (cards.length - 1)
      }}
    >
      {cards.map((c, i) => (
        <div key={c.id} style={{ marginTop: i !== 0 ? "-114%" : 0 }}>
          <CardShow
            showExhausted={true}
            showTokens={true}
            content="image"
            key={c.id}
            card={c}
          />
        </div>
      ))}
    </div>
  );
};

export const ZoneShow = (
  props:
    | { view: View; type: PlayerZoneType; owner: PlayerId }
    | { view: View; type: GameZoneType; owner?: never }
) => {
  const zone: ZoneState = props.owner
    ? values(props.view.players).find((p) => p.id === props.owner)?.zones[
        props.type
      ]
    : (props.view.zones as any)[props.type];

  const engine = useEngine();

  if (!zone) {
    return <>Zone not found</>;
  }

  const zoneCards = zone.cards.map(
    (card) => engine.state.cards.find((cd) => card === cd.id)!
  );

  return (
    <Paper
      style={{
        border: "solid 1px black",
        display: "flex",
        flexDirection: "column",
        margin: 4,
      }}
    >
      <div style={{ margin: 2 }}>
        {props.type} ({zone.cards.length} cards)
      </div>
      <Divider />
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          minWidth: 127,
          minHeight: 174,
        }}
      >
        {zone.cards.length !== 0 &&
          !zone.stack &&
          zoneCards
            .filter((c) => !c.attachedTo)
            .map((card) => (
              <CardBox
                key={card.id}
                card={props.view.cards.find((c) => c.id === card.id)!}
                attachments={props.view.cards.filter(
                  (c) => c.attachedTo === card.id
                )}
              />
            ))}

        {zone.cards.length !== 0 && zone.stack && (
          <CardShow
            content="image"
            card={props.view.cards.find((c) => c.id === zone.cards[0])!}
          />
        )}
      </div>
    </Paper>
  );
};
