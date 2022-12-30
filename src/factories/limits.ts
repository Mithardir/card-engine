import { ActionLimit, PlayerId } from "../types/basic";

export function eachPlayerOncePerRound(
  key: string
): (player: PlayerId) => ActionLimit {
  throw new Error("not implemented");
}

export function oncePerRound(key: string): (player: PlayerId) => ActionLimit {
  throw new Error("not implemented");
}
