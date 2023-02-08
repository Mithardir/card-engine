import { CardId, PlayerId } from "../../types/basic";
import { State } from "../../types/state";

export function getControllingCards(
  playerId: PlayerId,
  state: State
): CardId[] {
  const player = state.players[playerId];
  if (!player) {
    return [];
  }

  return player.zones.playerArea.cards;
}
