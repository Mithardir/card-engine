import { keys, sum, sumBy, values } from "lodash";
import { moveCard } from "../../engine/actions/basic";
import { cardAction } from "../../engine/actions/factories";
import { toView } from "../../engine/engine";
import { zoneTypeOf, playerZone } from "../../engine/getters";
import { Action, Getter } from "../../engine/types";
import playerBack from "../../images/back/card.jpg";
import {
  emptyKeywords,
  Phase,
  PlayerZoneType,
  Sphere,
} from "../../types/basic";
import { AllyProps } from "../../types/cards";
import { CardDefinition, CardId, PlayerId, State } from "../../types/state";
import { CardModifier, ViewModifier } from "../sets/core/quests";
import { and, Property } from "./test";

export function ownerOf(card: CardId): Getter<PlayerId | undefined> {
  return {
    print: `ownerOf(${card})`,
    get: (s) => {
      for (const player of values(s.players)) {
        for (const key of keys(player.zones)) {
          if (player.zones[key as PlayerZoneType].cards.includes(card)) {
            return player.id;
          }
        }
      }
    },
  };
}

export const playAlly = cardAction("playAlly", (c) => {
  const player = c.get(ownerOf(c.card.id));
  if (player) {
    c.run(
      moveCard({
        from: playerZone("hand", player),
        to: playerZone("playerArea", player),
        side: "face",
      }).card(c.card.id)
    );
  }
});

export function canPayResources(
  player: PlayerId,
  amount: number,
  sphere: Sphere
): Property<State, boolean> {
  return {
    print: `canPayResources(${player}, ${amount}, ${sphere})`,
    get: (state) => {
      const view = toView(state);
      const heroes = values(state.players[player]?.zones.playerArea.cards)
        .map((c) => view.cards[c])
        .filter((c) => c.props.type === "hero")
        .map((c) => c.id);

      const resources = sumBy(heroes, (id) => state.cards[id].token.resources);
      return resources >= amount;
    },
  };
}

export function isPhase(type: Phase): Property<State, boolean> {
  return {
    print: `isPhase(${type})`,
    get: (s) => s.phase === type,
  };
}

export function ally(props: AllyProps): CardDefinition {
  const image = `https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Core-Set/${props.name
    .split(" ")
    .join("-")}.jpg`;

  return {
    face: {
      ...props,
      image,
      type: "ally",
      keywords: emptyKeywords,
      abilities: [
        {
          description: "Play ally",
          implicit: true,
          modify: (card, s) => {
            const owner = ownerOf(card.id).get(s);
            if (owner && card.props.cost && card.props.sphere) {
              const zone = zoneTypeOf(card.id).get(s);
              if (zone === "hand") {
                card.actions.push({
                  title: `Play ${card.props.name}`,
                  canRun: and(
                    isPhase("planning"),
                    canPayResources(owner, card.props.cost, card.props.sphere)
                  ),
                  action: playAlly().card(card.id),
                });
              }
            }
          },
        },
      ],
    },
    back: {
      image: playerBack,
      traits: [],
      keywords: emptyKeywords,
    },
    orientation: "portrait",
  };
}
