import { ActionLimit } from "../types/basic";

export function eachPlayerOncePerRound(): ActionLimit {
  return {
    type: "phase",
    limit: 1,
    byPlayer: true,
  };
}

export function oncePerRound(): ActionLimit {
  return {
    type: "round",
    limit: 1,
    byPlayer: false,
  };
}
