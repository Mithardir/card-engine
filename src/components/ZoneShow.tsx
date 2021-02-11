import * as React from "react";
import { GameZoneType, PlayerId, PlayerZoneType, ZoneState, ZoneType } from "../engine/state";
import { CardView, View } from "../engine/view";
import { CardShow } from "./CardShow";

export const CardBox = (props: { cards: CardView[] }) => {
  const cards = props.cards;

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
          <CardShow showExhausted={true} showTokens={true} content="image" key={c.id} card={c} />
        </div>
      ))}
    </div>
  );
};

export const ZoneShow = (
  props: { view: View; type: PlayerZoneType; owner: PlayerId } | { view: View; type: GameZoneType; owner?: never }
) => {
  const zone: ZoneState = props.owner
    ? props.view.players.find((p) => p.id === props.owner)?.zones[props.type]
    : (props.view.zones as any)[props.type];

  if (!zone) {
    return <>Zone not found</>;
  }

  return (
    <div
      style={{
        border: "solid 1px black",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div>
        {props.type} ({zone.cards.length} cards)
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          minWidth: 127,
          minHeight: 174,
        }}
      >
        {/* {zone.cards.map((cid) => (
          <CardShow
            content="image"
            card={props.view.cards.find((c) => c.id)!}
          />
        ))} */}

        {zone.cards.length !== 0 &&
          !zone.stack &&
          zone.cards
            //.filter((c) => !c.attachedTo)
            .map((cardId) => <CardBox cards={props.view.cards.filter((c) => c.id === cardId)} />)}

        {zone.cards.length !== 0 && zone.stack && (
          <CardShow content="image" card={props.view.cards.find((c) => c.id === zone.cards[0])!} />
        )}
      </div>
    </div>
  );
};