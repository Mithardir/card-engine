import { cardAction } from "../factories";
import { CardId } from "../../../types/state";
import { Getter } from "../../types";
import { getProps, value } from "../../getters";
import { destroy } from "./destroy";
import { resolveResponses } from "../resolveResponses";
import { ifThenElse, sequence } from "../global";

export const dealDamage = cardAction<{
  damage: Getter<number>;
  attackers: Getter<CardId[]>;
}>("dealDamage", (c, args) => {
  const amount = c.get(args.damage);
  const props = c.get(getProps(c.card.id));
  const attackers = c.get(args.attackers);
  if (amount && props.hitPoints) {
    c.card.token.damage += amount;
    if (c.card.token.damage >= props.hitPoints) {
      return sequence(
        destroy().card(c.card.id),
        ifThenElse(
          value(props.type === "enemy"),
          resolveResponses(
            "Choose reponse for destroying enemy",
            (s) => s.enemyDestoryed,
            () => ({
              attackers: attackers,
              enemy: c.card.id,
            })
          ),
          sequence()
        )
      );
    }
  }
});
