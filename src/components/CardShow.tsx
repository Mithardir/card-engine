import { useContext, useState } from "react";
import damageImage from "../images/tokens/damage.png";
import resourceImage from "../images/tokens/resource.png";
import progressImage from "../images/tokens/progress.png";
import { DetailContext } from "./DetailContext";
import { CardText } from "./CardText";
import { CardState } from "../types/state";
import { CardView } from "../types/view";
import { produce } from "immer";
import { evaluateBool } from "../engine/queries/evaluateBool";
import { advanceToChoiceState } from "../engine/updates/advanceToChoiceState";
import { StateContext } from "./StateContext";
import { playerActions } from "../factories/actions";
import { canExecuteAction } from "../engine/queries/canExecuteAction";

export const CardShow = (props: {
  setError: (error: string) => void;
  state: CardState;
  view: CardView;
  content: "image" | "text";
  showExhausted?: boolean;
  showTokens?: boolean;
  scale?: number;
  style?: React.CSSProperties;
}) => {
  const { state, setState } = useContext(StateContext);
  const detail = useContext(DetailContext);
  const [zoom, setZoom] = useState(false);

  if (!props.state || !props.view) {
    return <>empty</>;
  }

  const actions = props.view.actions.filter(
    (a) => evaluateBool(a.enabled, state) && canExecuteAction(a.action, state)
  );

  const scale = props.scale || 0.28;
  const width = 430 * scale;
  const height = 600 * scale;

  const flipDimensions =
    props.state.definition.orientation === "landscape" &&
    props.content === "image";

  const isDetailCard = props.content === "image" && zoom;

  const margin = actions.length > 0 ? 1 : 3;

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
          : props.state.tapped && props.showExhausted
          ? "rotate(45deg)"
          : "initial",
        transition: "transform 0.25s ease 0s",
        zIndex: isDetailCard ? 5 : "initial",
        ...props.style,
      }}
      onMouseEnter={() => {
        if (props.state) {
          detail.setDetail(props.state?.id);
        }
      }}
      onWheel={(e) => {
        setZoom((p) => !p);
      }}
      onClick={async () => {
        if (actions.length === 0 || !state.choice || state.choice.dialog) {
          return;
        } else {
          if (actions.length === 1) {
            const action = actions[0];
            const title = state.choice.title;
            const newState = produce(state, (draft) => {
              draft.choice = undefined;
              draft.next.unshift(playerActions(title));
              draft.next.unshift(action.action);
              advanceToChoiceState(draft, props.setError);
            });

            setState(newState);
          } else {
            // TODO multiple actions
            // tslint:disable-next-line:no-console
            console.log("todo multiple actions");
          }
        }
      }}
    >
      {props.content === "text" ? (
        <CardText state={props.state} view={props.view} />
      ) : (
        <img
          src={props.view.props.image}
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
        {props.state.mark.questing && (
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
        {(props.state.mark.attacking || props.state.mark.attacked) && (
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
        {props.state.mark.defending && (
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
          {props.state.token.progress ? (
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
                {props.state.token.progress}
              </div>
            </div>
          ) : undefined}
          {props.state.token.resources ? (
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
                {props.state.token.resources}
              </div>
            </div>
          ) : undefined}

          {props.state.token.damage ? (
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
                {props.state.token.damage}
              </div>
            </div>
          ) : undefined}
        </div>
      )}
    </div>
  );
};
