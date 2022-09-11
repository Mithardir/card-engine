import { Divider, Paper } from "@mui/material";
import { PlayerId, State, View, ZoneState } from "./test10";
import { values } from "lodash";
import { GameZoneType, PlayerZoneType } from "./types";
import { CardBox } from "./CardBox";
import { CardShow } from "./CardShow";

export const ZoneShow = (
  props:
    | { state: State; view: View; type: PlayerZoneType; owner: PlayerId }
    | { state: State; view: View; type: GameZoneType; owner?: never }
) => {
  const zone: ZoneState = props.owner
    ? values(props.state.players).find((p) => p.id === props.owner)?.zones[
        props.type
      ]
    : (props.state.zones as any)[props.type];

  if (!zone) {
    return <>Zone not found</>;
  }

  const zoneCards = zone.cards.map((id) => props.state.cards[id]!);

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
        {props.type} ({zone.cards.length})
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
                state={props.state.cards[card.id]}
                view={props.view.cards[card.id]}
              />
            ))}

        {zone.cards.length !== 0 && zone.stack && (
          <CardShow
            content="image"
            state={props.state.cards[zone.cards[zone.cards.length - 1]]}
            view={props.view.cards[zone.cards[zone.cards.length - 1]]}
            showTokens
          />
        )}
      </div>
    </Paper>
  );
};
