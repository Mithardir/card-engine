import { CardId } from "../types/basic";
import { State, View } from "../types/state";
import { CardShow } from "./CardShow";

export const CardBox = (props: {
  cardId: CardId;
  state: State;
  view: View;
}) => {
  const cards = [...props.state.cards[props.cardId].attachments, props.cardId];
  return (
    <div
      style={{
        justifyContent: "center",
        display: "flex",
        flexDirection: "column-reverse",
      }}
    >
      {cards.map((c, i) => (
        <div
          key={c}
          style={{
            marginTop: i !== cards.length - 1 ? "-80%" : 0,
          }}
        >
          <CardShow
            showExhausted={true}
            showTokens={true}
            content="image"
            key={c}
            state={props.state.cards[c]}
            view={props.view.cards[c]}
          />
        </div>
      ))}
    </div>
  );
};
