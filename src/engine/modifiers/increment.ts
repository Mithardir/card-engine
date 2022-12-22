import { Until } from "../types";
import { CardModifier } from "./CardModifier";

export function increment(
  property: "attack" | "defense" | "willpower" | "hitPoints",
  amount: number,
  until?: Until
): CardModifier {
  return {
    print: `increment(${property}, ${amount}, ${until})`,
    to: (card) => {
      return {
        description: `+${amount} [${property}] to [${card}] ${
          until && "until " + until
        }`,
        apply: (v) => {
          const props = v.cards[card].props;
          if (props[property] !== undefined) {
            props[property]! += amount;
          }
        },
        until,
      };
    },
  };
}
