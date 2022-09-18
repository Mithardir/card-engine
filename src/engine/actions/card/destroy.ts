import { cardAction } from "../factories";
import { gameZone, getProps, playerZone } from "../../getters";
import { ownerOf } from "../../getters/ownerOf";
import { moveCard } from "../basic";
import { removeAllTokens } from "./removeAllTokens";

export const destroy = cardAction("destroy", (c) => {
  const props = c.get(getProps(c.card.id));
  c.run(removeAllTokens().card(c.card.id));

  if (props.type === "hero" || props.type === "ally") {
    const owner = c.get(ownerOf(c.card.id));
    if (owner) {
      c.run(
        moveCard({
          to: playerZone("discardPile", owner),
          side: "face",
        }).card(c.card.id)
      );
    }
  }

  if (props.type === "enemy") {
    c.run(
      moveCard({
        to: gameZone("discardPile"),
        side: "face",
      }).card(c.card.id)
    );
  }
});
