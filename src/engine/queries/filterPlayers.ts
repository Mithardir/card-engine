import { intersectionBy, isArray, values } from "lodash";
import { PlayerFilter } from "../../types/basic";
import { PlayerState, State } from "../../types/state";

export function filterPlayers(
  state: State,
  filter: PlayerFilter | undefined
): PlayerState[] {
  if (!filter) {
    return values(state.players);
  }

  if (typeof filter === "number") {
    return [state.players[filter]!];
  }

  if (isArray(filter)) {
    return filter.map((v) => state.players[v]!);
  }

  if (typeof filter === "string") {
    switch (filter) {
      case "A":
      case "B":
      case "C":
      case "D":
        const player = state.players[filter];
        if (!player) {
          throw new Error(`player ${filter} not found`);
        } else {
          return [player];
        }
      default:
        throw new Error("unknown player filter " + filter);
    }
  }

  switch (filter.type) {
    case "and": {
      return filter.predicates
        .map((predicate) => filterPlayers(state, predicate))
        .reduce((p, c) => intersectionBy(p, c, (item) => item.id));
    }

    default:
      throw new Error(
        `not implemented player filter: ${JSON.stringify(filter)} `
      );
  }

  throw new Error(`not implemented player filter: ${JSON.stringify(filter)} `);
}
