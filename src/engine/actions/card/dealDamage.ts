import { cardAction } from "../factories";
import { CardId } from "../../../types/state";
import { Getter } from "../../types";
import { getProps } from "../../getters";
import { destroy } from "./destroy";

export const dealDamage = cardAction<{
  damage: Getter<number>;
  attackers: CardId[];
}>("dealDamage", (c, args) => {
  const amount = c.get(args.damage);
  const props = c.get(getProps(c.card.id));
  if (amount && props.hitPoints) {
    c.card.token.damage += amount;
    if (c.card.token.damage >= props.hitPoints) {
      c.run(destroy().card(c.card.id));
    }
  }
});
