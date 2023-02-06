import { CardId } from "../types/basic";
import { CardShow } from "./CardShow";
import { useGameState } from "./StateContext";

export const CardBox = (props: {
  setError: (error: string) => void;
  cardId: CardId;
}) => {
  const { state, view } = useGameState();
  const cards = [...state.cards[props.cardId].attachments, props.cardId];
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
            setError={props.setError}
            showExhausted={true}
            showTokens={true}
            content="image"
            key={c}
            state={state.cards[c]}
            view={view.cards[c]}
          />
        </div>
      ))}
    </div>
  );
};
