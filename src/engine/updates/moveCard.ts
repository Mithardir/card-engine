import { CardId, Zone } from "../../types/basic";
import { State } from "../../types/state";
import { getZone } from "../queries/getZone";
import { getZoneOfCard } from "../queries/getZoneOfCard";

export function moveCard(state: State, id: CardId, target: Zone) {
  const sourceZone = getZoneOfCard(state, id);
  const targetZone = getZone(target, state);
  sourceZone.cards = sourceZone.cards.filter((c) => c !== id);
  targetZone.cards.push(id);
}
