import { moveCard } from "../basic";
import { cardAction } from "../factories";
import { sequence } from "../global";
import { shuffleLibrary } from "../player";
import { playerZone } from "../../getters";
import { ownerOf } from "../../getters/ownerOf";


export const moveToLibrary = cardAction("moveToLibrary", (c) => {
  const owner = c.get(ownerOf(c.card.id));
  if (owner) {
    return sequence(
      moveCard({
        to: playerZone("library", owner),
        side: "back",
      }).card(c.card.id),
      shuffleLibrary().player(owner)
    );
  }
});
