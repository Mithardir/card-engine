import { CardState, CardView } from "../types/state";
import { CardShow } from "./CardShow";

export const CardBox = (props: { state: CardState; view: CardView }) => {
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
      <div style={{ marginTop: 0 }}>
        <CardShow
          showExhausted={true}
          showTokens={true}
          content="image"
          state={props.state}
          view={props.view}
        />
      </div>
    </div>
  );
};
