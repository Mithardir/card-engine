import { removeToken } from "../basic";
import { playerAction } from "../factories";
import { chooseCardAction, repeat } from "../global";
import { and, hasResource, isHero, isInZone } from "../../filters";
import { playerZone, value } from "../../getters";
import { Sphere } from "../../../types/basic";

export const payResources = playerAction<[number, Sphere]>(
  "payResources",
  (c, args) => {
    const sphere = args[1];
    const amount = args[0];
    c.run(
      repeat(
        value(amount),
        chooseCardAction(
          "Choose hero to pay 1 resource",
          and(
            isHero,
            isInZone(playerZone("playerArea", c.player.id)),
            hasResource(sphere)
          ),
          removeToken({ amount: 1, token: "resources" }),
          false
        )
      )
    );
  }
);
