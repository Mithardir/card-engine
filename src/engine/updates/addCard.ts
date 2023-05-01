import { Side, Zone } from "../../types/basic";
import { CardDefinition } from "../../types/cards";
import { State } from "../../types/state";
import { getZone } from "../queries/getZone";

export function addCard(
  state: State,
  definition: CardDefinition,
  side: Side,
  zone: Zone
) {
  const id = state.nextId;
  state.cards[id] = {
    id,
    token: {
      damage: 0,
      progress: 0,
      resources: 0,
    },
    mark: {
      questing: false,
      attacking: false,
      defending: false,
      attacked: false,
    },
    sideUp: side,
    tapped: false,
    definition: definition,
    attachments: [],
    owner: zone.owner,
    controller: zone.owner,
    limitUses: {
      perPhase: {},
      perRound: {},
    },
  };
  state.nextId++;

  getZone(zone, state).cards.push(id);
  return id;
}
