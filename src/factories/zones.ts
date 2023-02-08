import { GameZoneType, Zone, PlayerId, PlayerZoneType } from "../types/basic";

export function gameZone(type: GameZoneType): Zone {
  return {
    owner: "game",
    type,
  };
}

export function playerZone(player: PlayerId, type: PlayerZoneType): Zone {
  return {
    owner: player,
    type,
  };
}
