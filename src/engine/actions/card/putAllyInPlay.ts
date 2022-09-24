import { moveCard } from "../basic";
import { cardAction } from "../factories";
import { playerZone } from "../../getters";
import { controllerOf } from "../../getters/controllerOf";
import { resolveResponses } from "../resolveResponses";
import { sequence } from "../global";

export const putAllyInPlay = cardAction("playAlly", (c) => {
  const player = c.get(controllerOf(c.card.id));
  if (player) {
    return sequence(
      moveCard({
        from: playerZone("hand", player),
        to: playerZone("playerArea", player),
        side: "face",
      }).card(c.card.id),
      resolveResponses(
        "Choose response for entering play",
        (s) => s.enteredPlay,
        (s) => ({ card: c.card.id })
      )
    );
  }
});
