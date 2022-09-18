import { moveCard } from "../basic";
import { cardAction } from "../factories";
import { playerZone } from "../../getters";
import { ownerOf } from "../../getters/ownerOf";

export const playAlly = cardAction("playAlly", (c) => {
  const player = c.get(ownerOf(c.card.id));
  if (player) {
    c.run(
      moveCard({
        from: playerZone("hand", player),
        to: playerZone("playerArea", player),
        side: "face",
      }).card(c.card.id)
    );
  }
});
