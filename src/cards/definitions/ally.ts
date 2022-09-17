import { keys, values } from "lodash";
import { moveCard } from "../../engine/actions/basic";
import { cardAction } from "../../engine/actions/factories";
import { getZoneType, playerZone } from "../../engine/getters";
import { Getter } from "../../engine/types";
import playerBack from "../../images/back/card.jpg";
import { emptyKeywords, PlayerZoneType } from "../../types/basic";
import { AllyProps } from "../../types/cards";
import { CardDefinition, CardId, PlayerId } from "../../types/state";

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
          modifier: (self) => {
            return {
              print: "Play ally",
              modify: (v, s) => {
                const zone = getZoneType(self).get(s);
                if (zone === "hand") {
                  const card = v.cards[self];
                  v.cards[self].actions.push({
                    title: `Play ${card.props.name}`,
                    action: playAlly().card(self),
                  });
                }
              },
            };
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
