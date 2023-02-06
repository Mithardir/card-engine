import { Zone } from "../../types/basic";
import { State } from "../../types/state";

export function getZone(zone: Zone, state: State) {
  if (zone.owner === "game") {
    return state.zones[zone.type];
  } else {
    return state.players[zone.owner]!.zones[zone.type];
  }
}
