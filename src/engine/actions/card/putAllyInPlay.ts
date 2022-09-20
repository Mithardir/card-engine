import { moveCard } from "../basic";
import { cardAction } from "../factories";
import { playerZone } from "../../getters";
import { ownerOf } from "../../getters/ownerOf";
import { resolveResponses } from "../resolveResponses";

export const putAllyInPlay = cardAction("playAlly", (c) => {
  const player = c.get(ownerOf(c.card.id));
  if (player) {
    c.run(
      moveCard({
        from: playerZone("hand", player),
        to: playerZone("playerArea", player),
        side: "face",
      }).card(c.card.id)
    );
    c.run(
      resolveResponses(
        "Choose response for entering play",
        (s) => s.enteredPlay,
        (s) => ({ card: c.card.id })
      )
    );
  }
});
