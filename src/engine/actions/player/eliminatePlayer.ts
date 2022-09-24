import { playerAction } from "../factories";
import { values } from "lodash";

export const eliminatePlayer = playerAction("eliminatePlayer", (c) => {
  return {
    print: "eliminatePlayer",
    apply: (s) => {
      if (values(s.players).length === 1) {
        s.choice = undefined;
        s.next = [];
        s.result = "lost";
      } else {
        delete s.players[c.player.id];
      }
    },
  };
});
