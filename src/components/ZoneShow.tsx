import { Divider, Paper } from "@mui/material";
import { values } from "lodash";
import { PlayerZoneType, GameZoneType } from "../types/basic";
import { State, View, PlayerId, ZoneState } from "../types/state";
import { CardBox } from "./CardBox";
import { CardShow } from "./CardShow";

export const ZoneShow = (
  props:
    | {
        state: State;
        view: View;
        type: PlayerZoneType;
        owner: PlayerId;
        showAttachments?: boolean;
      }
    | {
        state: State;
        view: View;
        type: GameZoneType;
        owner?: never;
        showAttachments?: boolean;
      }
) => {
  const zone: ZoneState = props.owner
    ? values(props.state.players).find((p) => p.id === props.owner)?.zones[
        props.type
      ]
    : (props.state.zones as any)[props.type];

  if (!zone) {
    return <>Zone not found</>;
  }

  const zoneCards = zone.cards.map((id) => props.view.cards[id]!);

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
          alignItems: "flex-start",
        }}
      >
        {zone.cards.length !== 0 &&
          !zone.stack &&
          zoneCards
            .filter(
              (c) => props.showAttachments || c.props.type !== "attachment"
            )
            .map((card) => (
              <CardBox
                key={card.id}
                cardId={card.id}
                state={props.state}
                view={props.view}
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
