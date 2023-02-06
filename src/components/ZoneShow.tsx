import { Divider, Paper } from "@mui/material";
import { values } from "lodash";
import { PlayerZoneType, GameZoneType, PlayerId } from "../types/basic";
import { ZoneState } from "../types/state";
import { CardBox } from "./CardBox";
import { CardShow } from "./CardShow";
import { useGameState } from "./StateContext";

export const ZoneShow = (
  props:
    | {
        setError: (error: string) => void;
        type: PlayerZoneType;
        owner: PlayerId;
        showAttachments?: boolean;
      }
    | {
        setError: (error: string) => void;
        type: GameZoneType;
        owner?: never;
        showAttachments?: boolean;
      }
) => {
  const { state, view } = useGameState();

  const zone: ZoneState = props.owner
    ? values(state.players).find((p) => p.id === props.owner)?.zones[props.type]
    : (state.zones as any)[props.type];

  if (!zone) {
    return <>Zone not found</>;
  }

  const zoneCards = zone.cards.map((id) => view.cards[id]!);

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
                setError={props.setError}
                key={card.id}
                cardId={card.id}
              />
            ))}

        {zone.cards.length !== 0 && zone.stack && (
          <CardShow
            setError={props.setError}
            content="image"
            state={state.cards[zone.cards[zone.cards.length - 1]]}
            view={view.cards[zone.cards[zone.cards.length - 1]]}
            showTokens
          />
        )}
      </div>
    </Paper>
  );
};
