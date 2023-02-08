import { PlayerId, PlayerPredicate } from "../../types/basic";
import { State } from "../../types/state";

export function evaluatePlayerPredicate(
  state: State,
  player: PlayerId,
  predicate: PlayerPredicate
): boolean {
  if (typeof predicate === "string") {
    switch (predicate) {
      default: {
        throw new Error("unknown predicate: " + predicate);
      }
    }
  } else {
    switch (predicate.type) {
      default: {
        throw new Error("unknown predicate: " + JSON.stringify(predicate));
      }
    }
  }
}
