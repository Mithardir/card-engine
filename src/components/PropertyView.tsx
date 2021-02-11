import * as React from "react";
import { CardView } from "../engine/view";
import { SetIntersection } from "utility-types";

export const PropertyView = (props: {
  card: CardView;
  label: string;
  property: SetIntersection<keyof CardView["printed"], keyof CardView["props"]>;
}) => {
  const c = props.card;
  const printed = c.printed[props.property] as number;
  const value = c.props[props.property] as number;
  const bonus = value - printed;
  return (
    <tr>
      <td>{props.label}</td>
      {bonus > 0 && (
        <td>
          {printed} (+
          {bonus})
        </td>
      )}
      {bonus === 0 && <td>{printed}</td>}
      {bonus < 0 && (
        <td>
          {printed} ({bonus})
        </td>
      )}
    </tr>
  );
};
