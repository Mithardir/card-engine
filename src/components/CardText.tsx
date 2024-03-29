import * as React from "react";
import { CardState } from "../types/state";
import { CardView } from "../types/view";
import { AbilityText } from "./AbilityText";
import { PropertyView } from "./PropertyView";
import { StateContext } from "./StateContext";

export const CardText = (props: { state: CardState; view: CardView }) => {
  const c = {
    id: props.state.id,
    tapped: false,
    sideUp: "face",
    token: props.state.token,
    props: { ...props.view.props },
    attachments: props.state.attachments,
    owner: props.state.owner,
    controller: props.state.controller,
  };

  const { state } = React.useContext(StateContext);

  return (
    <table style={{ width: "100%" }}>
      <tbody>
        <tr>
          <td colSpan={4} style={{ textAlign: "center" }}>
            {c.owner && c.controller
              ? `O: ${c.owner}, C: ${c.controller} `
              : null}
            {!c.props.type && <React.Fragment>[{c.id}]</React.Fragment>}
            {c.props.type === "hero" && (
              <React.Fragment>
                {c.props.name} [{c.id}] (H) {c.tapped && "E"}
              </React.Fragment>
            )}
            {c.props.type === "ally" && (
              <React.Fragment>
                {c.props.name} [{c.id}] {c.props.unique && "(*)"}{" "}
                {c.tapped && "E"} ({c.props.cost})
              </React.Fragment>
            )}
            {c.props.type === "event" && (
              <React.Fragment>
                {c.props.name} [{c.id}] ({c.props.cost})
              </React.Fragment>
            )}
            {c.props.type === "attachment" && (
              <React.Fragment>
                {c.props.name} [{c.id}] ({c.props.cost})
              </React.Fragment>
            )}
            {c.props.type === "enemy" && (
              <React.Fragment>
                {c.props.name} [{c.id}] ({c.props.engagement}/{c.props.threat})
              </React.Fragment>
            )}
            {c.props.type === "location" && (
              <React.Fragment>
                {c.props.name} [{c.id}] ({c.props.threat})
              </React.Fragment>
            )}
            {c.props.type === "quest" && (
              <React.Fragment>
                {c.props.name} [{c.id}] ({c.sideUp}
                {c.props.sequence})
              </React.Fragment>
            )}
            {c.props.type === "treachery" && (
              <React.Fragment>
                {c.props.name} [{c.id}]
              </React.Fragment>
            )}
          </td>
        </tr>
        {(c.props.type === "location" || c.props.type === "quest") && (
          <React.Fragment>
            <PropertyView
              view={props.view}
              state={props.state}
              property="threat"
              label="Threat"
            />
            <PropertyView
              view={props.view}
              state={props.state}
              property="questPoints"
              label="Quest points"
            />
            <tr>
              <td>Progress</td>
              <td>{c.token.progress}</td>
              <td>
                <button onClick={() => c.token.progress++}>+</button>
              </td>
              <td>
                <button onClick={() => c.token.progress--}>-</button>
              </td>
            </tr>
          </React.Fragment>
        )}
        {c.props.type === "enemy" && (
          <React.Fragment>
            <PropertyView
              view={props.view}
              state={props.state}
              property="threat"
              label="Threat"
            />
            <PropertyView
              view={props.view}
              state={props.state}
              property="attack"
              label="Attack"
            />
            <PropertyView
              view={props.view}
              state={props.state}
              property="defense"
              label="Defense"
            />
            <PropertyView
              view={props.view}
              state={props.state}
              property="hitPoints"
              label="Hitpoints"
            />
            <tr>
              <td>Damage</td>
              <td>{c.token.damage}</td>
            </tr>
          </React.Fragment>
        )}
        {(c.props.type === "ally" || c.props.type === "hero") && (
          <React.Fragment>
            <PropertyView
              view={props.view}
              state={props.state}
              property="willpower"
              label="Willpower"
            />
            <PropertyView
              view={props.view}
              state={props.state}
              property="attack"
              label="Attack"
            />
            <PropertyView
              view={props.view}
              state={props.state}
              property="defense"
              label="Defense"
            />
            <PropertyView
              view={props.view}
              state={props.state}
              property="hitPoints"
              label="Hitpoints"
            />
            <tr>
              <td>Damage</td>
              <td>{c.token.damage}</td>
            </tr>
            <tr>
              <td>Resources</td>
              <td>{c.token.resources}</td>
            </tr>
          </React.Fragment>
        )}
        {c.props.traits && (
          <tr>
            <td colSpan={3}>
              <b>{c.props.traits!.join(", ")}</b>
            </td>
          </tr>
        )}
        {c.props.abilities &&
          c.props.abilities.map((a, i) => (
            <tr key={i}>
              <td colSpan={4}>
                <AbilityText key={i} ability={a} />
              </td>
            </tr>
          ))}
        {c.attachments.length > 0 && (
          <tr>
            <td>
              Attachments:{" "}
              {c.attachments
                .map((id) => state.cards[id].definition.face.name)
                .join(",")}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};
