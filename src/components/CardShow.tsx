import * as React from "react";
import { CardView } from "../engine/view";
import { CardText } from "./CardText";

const damegeImage = require("../Images/tokens/damage.png");
const resourceImage = require("../Images/tokens/resource.png");
const progressImage = require("../Images/tokens/progress.png");

export const CardShow = (props: {
  card: CardView;
  content: "image" | "text";
  showExhausted?: boolean;
  showTokens?: boolean;
  scale?: number;
  style?: React.CSSProperties;
}) => {
  const c = props.card;
  const actions: any[] = []; //c.actions.filter((a) => a.enabled);

  const scale = props.scale || 0.28;
  const width = 430 * scale;
  const height = 600 * scale;

  const flipDimensions = props.content === "image" && c.props.type === "quest";
  const isDetailCard = false; //c === game.detailCard;

  const margin = actions.length > 0 ? 1 : 3;

  return (
    <div
      style={{
        border: actions.length > 0 ? "2px solid yellow" : undefined,
        margin,
        height: flipDimensions ? width : height,
        width: flipDimensions ? height : width,
        position: "relative",
        marginTop: margin,
        marginLeft: margin,
        transform: isDetailCard
          ? "scale(2.5,2.5)"
          : c.tapped && props.showExhausted
          ? "rotate(45deg)"
          : undefined,
        transition: "transform 0.25s ease 0s",
        zIndex: isDetailCard ? 5 : undefined,
        ...props.style,
      }}
      onMouseEnter={() => {
        //game.detailCard = c;
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
            await actions[0].do();
          } else {
            // TODO multiple actions
            // tslint:disable-next-line:no-console
            console.log("todo multiple actions");
          }
        }
      }}
    >
      {props.content === "text" ? (
        <CardText card={props.card} />
      ) : (
        <img
          src={c.props.image}
          width={flipDimensions ? height : width}
          height={flipDimensions ? width : height}
          style={{}}
          alt=""
        />
      )}
      {props.showTokens && (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            marginLeft: "30%",
            marginTop: "3%",
            minWidth: "70%",
            justifyContent: "space-evenly",
            position: "absolute",
            top: 0,
          }}
        >
          {c.progress ? (
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
                {c.progress}
              </div>
            </div>
          ) : undefined}
          {c.resources ? (
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
                {c.resources}
              </div>
            </div>
          ) : undefined}

          {c.damage ? (
            <div
              style={{
                position: "relative",
                width: 40,
                height: 40,
                margin: 2,
              }}
            >
              <img src={damegeImage} width={40} height={40} alt="" />
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
                {c.damage}
              </div>
            </div>
          ) : undefined}
        </div>
      )}
    </div>
  );
};
