import { State, ZoneState } from "./state";
import { ZoneKey, CommandResult } from "./types";

export function getZone(key: ZoneKey): (state: State) => ZoneState {
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

export function mergeOrResults(results: CommandResult[]): CommandResult {
  if (results.some((c) => c === "full")) {
    return "full";
  }

  if (results.every((c) => c === "none")) {
    return "none";
  }

  return "partial";
}

export function mergeAndResults(...results: CommandResult[]): CommandResult {
  if (results.every((c) => c === "full")) {
    return "full";
  }

  if (results.every((c) => c === "none")) {
    return "none";
  }

  return "partial";
}
