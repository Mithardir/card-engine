import { cardAction } from "../factories";
import { gameZone, getProps, isSame, playerZone, value } from "../../getters";
import { ownerOf } from "../../getters/ownerOf";
import { moveCard } from "../basic";
import { removeAllTokens } from "./removeAllTokens";
import { ifThen, sequence } from "../global";
import { and, hasOwner, isHero, isInPlay } from "../../filters";
import { eliminatePlayer } from "../player/eliminatePlayer";
import { countCards } from "../../countCards";

export const destroy = cardAction("destroy", (c) => {
  const props = c.get(getProps(c.card.id));
  const owner = c.get(ownerOf(c.card.id));

  return sequence(
    removeAllTokens().card(c.card.id),
    ifThen(
      value((props.type === "hero" || props.type === "ally") && !!owner),
      sequence(
        moveCard({
          to: playerZone("discardPile", owner!),
          side: "face",
        }).card(c.card.id),
        ifThen(
          isSame(countCards(and(isHero, isInPlay, hasOwner(owner!))), value(0)),
          eliminatePlayer().player(owner!)
        )
      )
    ),
    ifThen(
      value(props.type === "enemy"),
      moveCard({
        to: gameZone("discardPile"),
        side: "face",
      }).card(c.card.id)
    )
  );
});
