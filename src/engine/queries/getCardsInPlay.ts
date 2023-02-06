import { values } from "lodash";
import { CardId } from "../../types/basic";
import { State } from "../../types/state";

export function getCardsInPlay(state: State): CardId[] {
  const gameCards = [
    ...state.zones.activeLocation.cards,
    ...state.zones.stagingArea.cards,
  ];

  const playerCards = values(state.players).flatMap((p) => [
    ...p.zones.engaged.cards,
    ...p.zones.playerArea.cards,
  ]);

  return [...gameCards, ...playerCards];
}
