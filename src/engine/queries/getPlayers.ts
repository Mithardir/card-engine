import { isArray, values } from "lodash";
import { PlayerFilter } from "../../types/basic";
import { State } from "../../types/state";

export function getPlayers(state: State, filter: PlayerFilter) {
  if (typeof filter === "string") {
    if (filter === "active") {
      return values(state.players);
    }
    if (filter === "first") {
      throw new Error("not implemented");
    }

    return [state.players[filter]!];
  } else if (isArray(filter)) {
    return filter.map((v) => state.players[v]!);
  } else {
    throw new Error("not implemented");
  }
}
