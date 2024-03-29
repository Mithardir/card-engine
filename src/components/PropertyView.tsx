import * as React from "react";
import { PrintedProps } from "../types/cards";
import { CardState } from "../types/state";
import { CardView } from "../types/view";

export const PropertyView = (props: {
  view: CardView;
  state: CardState;
  label: string;
  property: keyof PrintedProps;
}) => {
  const printed = props.state.definition.face[props.property] as number;
  const value = props.view.props[props.property] as number;
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
