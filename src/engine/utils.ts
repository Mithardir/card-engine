import { ActionEffect } from "./actions2";
import { State, ZoneState } from "./state";
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

export function mergeOrResults(results: ActionEffect[]): ActionEffect {
  if (results.some((c) => c === "full")) {
    return "full";
  }

  if (results.every((c) => c === "none")) {
    return "none";
  }

  return "partial";
}

export function mergeAndResults(...results: ActionEffect[]): ActionEffect {
  if (results.every((c) => c === "full")) {
    return "full";
  }

  if (results.every((c) => c === "none")) {
    return "none";
  }

  return "partial";
}
