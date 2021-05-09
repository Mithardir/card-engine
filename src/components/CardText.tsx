import * as React from "react";
import { addToken } from "../engine/actions/card";
import { CardView } from "../engine/view";
import { useEngine } from "./EngineContext";
import { PropertyView } from "./PropertyView";

export const CardText = (props: { card: CardView }) => {
  const c = props.card;

  const engine = useEngine();

  return (
    <table>
      <tbody>
        <tr>
          <td colSpan={4} style={{ textAlign: "center" }}>
            {!c.props.type && <React.Fragment>[{c.id}]</React.Fragment>}
            {c.props.type === "hero" && (
              <React.Fragment>
                {c.props.name} [{c.id}] (H) {c.tapped && "E"}
              </React.Fragment>
            )}
            {c.props.type === "ally" && (
              <React.Fragment>
                {c.props.name} [{c.id}] {c.props.unique && "(*)"} {c.tapped && "E"} ({c.props.cost})
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
            <PropertyView card={c} property="threat" label="Threat" />
            <PropertyView card={c} property="questPoints" label="Quest points" />
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
            <tr>
              <td>{/* <button onClick={() => c.flip()}>Flip</button> */}</td>
            </tr>
          </React.Fragment>
        )}
        {c.props.type === "enemy" && (
          <React.Fragment>
            <PropertyView card={c} property="threat" label="Threat" />
            <PropertyView card={c} property="attack" label="Attack" />
            <PropertyView card={c} property="defense" label="Defense" />
            <PropertyView card={c} property="hitPoints" label="Hitpoints" />
            <tr>
              <td>Damage</td>
              <td>{c.token.damage}</td>
              <td>
              <button onClick={() => engine.do(addToken("damage")(c.id))}>+</button>
              </td>
              <td>
                {/* <button onClick={() => card.update(removeToken("damage"))}>
                  -
                </button> */}
              </td>
            </tr>
          </React.Fragment>
        )}
        {(c.props.type === "ally" || c.props.type === "hero") && (
          <React.Fragment>
            <PropertyView card={c} property="willpower" label="Willpower" />
            <PropertyView card={c} property="attack" label="Attack" />
            <PropertyView card={c} property="defense" label="Defense" />
            <PropertyView card={c} property="hitPoints" label="Hitpoints" />
            <tr>
              <td>Damage</td>
              <td>{c.token.damage}</td>
              <td>
              <button onClick={() => engine.do(addToken("damage")(c.id))}>+</button>
              </td>
              <td>
                {/* <button onClick={() => card.update(removeToken("damage"))}>
                  -
                </button> */}
              </td>
            </tr>
            <tr>
              <td>Resources</td>
              <td>{c.token.resources}</td>
              <td>
                {/* <button onClick={() => card.update(addToken("resources"))}>
                  +
                </button> */}
              </td>
              <td>
                {/* <button onClick={() => card.update(removeToken("resources"))}>
                  -
                </button> */}
              </td>
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
        {c.props.abilities.map((a, i) => (
          <tr key={i}>
            <td colSpan={4}>{a.description}</td>
          </tr>
        ))}
        {/* <tr>
      <td>
        <button disabled={c.exhausted} onClick={() => c.exhaust()}>
          exhaust
        </button>
        <button disabled={!c.exhausted} onClick={() => c.ready()}>
          ready
        </button>
      </td>
    </tr> */}
        {/* {c.attachments.length > 0 && (
                    <tr>
                      <td>Attachments: {c.attachments.map(a => a.name).join(",")}</td>
                    </tr>
                  )} */}
      </tbody>
    </table>
  );
};
