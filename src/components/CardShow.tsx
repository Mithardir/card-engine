import * as React from "react";
import { CardView } from "../engine/view";
import { CardText } from "./CardText";
import { DetailContext } from "./DetailContext";

import damageImage from "../Images/tokens/damage.png";
import resourceImage from "../Images/tokens/resource.png";
import progressImage from "../Images/tokens/progress.png";
import { CardId } from "../engine/state";
import { useEngine } from "./EngineContext";
import { observer } from "mobx-react-lite";

export const CardShow = observer(
  (props: {
    card?: CardView;
    cardId?: CardId;
    content: "image" | "text";
    showExhausted?: boolean;
    showTokens?: boolean;
    scale?: number;
    style?: React.CSSProperties;
  }) => {
    const engine = useEngine();

    const card =
      props.card || engine.state.view.cards.find((c) => c.id === props.cardId)!;
    const actions = card.actions.filter((a) =>
      a.condition.eval(engine.state.view)
    );

    const scale = props.scale || 0.28;
    const width = 430 * scale;
    const height = 600 * scale;

    const flipDimensions =
      props.content === "image" && card.props.type === "quest";
    const isDetailCard = false; //c === game.detailCard;

    const margin = actions.length > 0 ? 1 : 3;

    const detail = React.useContext(DetailContext);

    return (
      <div
        style={{
          border: actions.length > 0 ? "2px solid yellow" : "initial",
          margin,
          height: flipDimensions ? width : height,
          width: flipDimensions ? height : width,
          position: "relative",
          marginTop: margin,
          marginLeft: margin,
          transform: isDetailCard
            ? "scale(2.5,2.5)"
            : card.tapped && props.showExhausted
            ? "rotate(45deg)"
            : "initial",
          transition: "transform 0.25s ease 0s",
          zIndex: isDetailCard ? 5 : "initial",
          ...props.style,
        }}
        onMouseEnter={() => {
          detail.setDetail(card.id);
        }}
        onMouseLeave={() => {
          //game.detailCard = undefined;
        }}
        // onWheel={e => {
        //   game.detailCard = e.deltaY > 0 ? c : undefined;
        // }}
        onClick={async () => {
          if (actions.length === 0) {
            return;
          } else {
            if (actions.length === 1) {
              await engine.do(actions[0].effect);
            } else {
              // TODO multiple actions
              // tslint:disable-next-line:no-console
              console.log("todo multiple actions");
            }
          }
        }}
      >
        {props.content === "text" ? (
          <CardText card={card} />
        ) : (
          <img
            src={card.props.image}
            width={flipDimensions ? height : width}
            height={flipDimensions ? width : height}
            style={{}}
            alt=""
          />
        )}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            marginLeft: "0%",
            marginTop: "3%",
            minWidth: "70%",
            justifyContent: "space-evenly",
            position: "absolute",
            top: 0,
          }}
        >
          {card.mark.questing && (
            <div
              style={{
                position: "relative",
                width: 20,
                height: 20,
                margin: 1,
                backgroundColor: "white",
              }}
            >
              <img
                src="http://hallofbeorn.com/Images/willpower-med.png"
                width={20}
                height={20}
                alt=""
              />
            </div>
          )}
          {card.mark.attacking && (
            <div
              style={{
                position: "relative",
                width: 20,
                height: 20,
                margin: 1,
                backgroundColor: "white",
              }}
            >
              <img
                src="http://hallofbeorn.com/Images/attack-small.png"
                width={20}
                height={20}
                alt=""
              />
            </div>
          )}
          {card.mark.defending && (
            <div
              style={{
                position: "relative",
                width: 20,
                height: 20,
                margin: 1,
                backgroundColor: "white",
              }}
            >
              <img
                src="http://hallofbeorn.com/Images/defense-small.png"
                width={20}
                height={20}
                alt=""
              />
            </div>
          )}
        </div>
        {props.showTokens && (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              marginLeft: "30%",
              marginTop: "20%",
              minWidth: "70%",
              justifyContent: "space-evenly",
              position: "absolute",
              top: 0,
            }}
          >
            {card.token.progress ? (
              <div
                style={{
                  position: "relative",
                  width: 45,
                  height: 45,
                  margin: 1,
                }}
              >
                <img src={progressImage} width={45} height={45} alt="" />
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    color: "white",
                    fontSize: "x-large",
                  }}
                >
                  {card.token.progress}
                </div>
              </div>
            ) : undefined}
            {card.token.resources ? (
              <div
                style={{
                  position: "relative",
                  width: 40,
                  height: 40,
                  margin: 2,
                }}
              >
                <img src={resourceImage} width={40} height={40} alt="" />
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    color: "white",
                    fontSize: "x-large",
                  }}
                >
                  {card.token.resources}
                </div>
              </div>
            ) : undefined}

            {card.token.damage ? (
              <div
                style={{
                  position: "relative",
                  width: 40,
                  height: 40,
                  margin: 2,
                }}
              >
                <img src={damageImage} width={40} height={40} alt="" />
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    color: "white",
                    fontSize: "x-large",
                  }}
                >
                  {card.token.damage}
                </div>
              </div>
            ) : undefined}
          </div>
        )}
      </div>
    );
  }
);
