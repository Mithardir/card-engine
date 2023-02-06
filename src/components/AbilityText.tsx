import * as React from "react";
import { Ability } from "../types/basic";

export const AbilityText = (props: { ability: Ability }) => {
  switch (props.ability.type) {
    case "Keyword":
      return null;
    case "CharacterAction":
    case "EventAction":
    case "ModifySelf":
    case "Response":
      return <>{props.ability.description}</>;
    default:
      return <>unknown ability: {JSON.stringify(props.ability)}</>;
  }
};
