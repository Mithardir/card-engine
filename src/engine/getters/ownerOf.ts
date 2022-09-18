import { keys, values } from "lodash";
import { Getter } from "../types";
import { PlayerZoneType } from "../../types/basic";
import { CardId, PlayerId } from "../../types/state";

export function ownerOf(card: CardId): Getter<PlayerId | undefined> {
  return {
    print: `ownerOf(${card})`,
    get: (s) => {
      for (const player of values(s.players)) {
        for (const key of keys(player.zones)) {
          if (player.zones[key as PlayerZoneType].cards.includes(card)) {
            return player.id;
          }
        }
      }
    },
  };
}
