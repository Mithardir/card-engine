import { values } from "lodash";
import { CardId } from "../../types/basic";
import { State, ZoneState } from "../../types/state";

export function getZoneOfCard(state: State, id: CardId): ZoneState {
  for (const zone of values(state.zones)) {
    if (zone.cards.includes(id)) {
      return zone;
    }
  }

  for (const player of values(state.players)) {
    for (const zone of values(player.zones)) {
      if (zone.cards.includes(id)) {
        return zone;
      }
    }
  }

  throw new Error("zone of card not found");
}
