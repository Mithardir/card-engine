import { CardFilter } from "./filters";
import { GameZoneType, PlayerId, PlayerZoneType, State, ZoneState } from "./state";
import { ZoneKey } from "./types";
import { View } from "./view";

export function getZone(key: ZoneKey): (state: State | View) => ZoneState {
  return (v) => {
    if (key.player) {
      const player = v.players.find((p) => p.id === key.player);
      if (player) {
        return player.zones[key.type];
      }
    } else {
      return (v.zones as any)[key.type];
    }
  };
}

export function zoneKey(type: PlayerZoneType, player: PlayerId): ZoneKey;
export function zoneKey(type: GameZoneType): ZoneKey;
export function zoneKey(type: PlayerZoneType | GameZoneType, player?: PlayerId): ZoneKey {
  return {
    type,
    player,
    print: player ? `zone(${type}, ${player})` : `zone(${type})`,
  } as ZoneKey;
}

export const filterCards = (filter: CardFilter, view: View) =>
  view.cards.filter((c) => filter(c).eval(view)).map((z) => z);
