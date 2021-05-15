import { AttachmentProps, Ability, emptyKeywords } from "../../engine/types";
import { CardDefinition, CardId, State, ZoneState } from "../../engine/state";
import playerBack from "../../Images/back/card.jpg";
import { CardFilter } from "../../engine/filters";
import { chooseCardAction } from "../../engine/actions/choices";
import { CardAction } from "../../engine/actions/types";
import { action, pay } from "../../engine/actions/control";
import { payResources } from "../../engine/actions/player";
import { countResources } from "../../engine/exps";

export function attaches(props: { description: string; filter: CardFilter }): Ability {
  return {
    description: props.description,
    implicit: false,
    activate: (view, self) => {
      const card = view.cards.find((c) => c.id === self);
      const owner = view.players.find((p) => p.zones.hand.cards.includes(self))?.id;
      const cost = card?.props.cost;
      const sphere = card?.props.sphere;
      if (card && owner && cost && sphere && view.players.some((p) => p.zones.hand.cards.includes(self))) {
        const canPay = countResources(sphere, owner).eval(view) >= cost;
        if (canPay) {
          card.actions.push({
            description: props.description,
            effect: pay(payResources(cost, sphere)(owner), chooseCardAction("Attach to", props.filter, attachTo(self))),
          });
        }
      }
    },
  };
}

export function findZoneOf(cardId: CardId, state: State): ZoneState {
  if (state.zones.activeLocation.cards.includes(cardId)) {
    return state.zones.activeLocation;
  }

  if (state.zones.discardPile.cards.includes(cardId)) {
    return state.zones.discardPile;
  }

  if (state.zones.encounterDeck.cards.includes(cardId)) {
    return state.zones.encounterDeck;
  }

  if (state.zones.quest.cards.includes(cardId)) {
    return state.zones.quest;
  }

  if (state.zones.questDeck.cards.includes(cardId)) {
    return state.zones.questDeck;
  }

  if (state.zones.stagingArea.cards.includes(cardId)) {
    return state.zones.stagingArea;
  }

  if (state.zones.victoryDisplay.cards.includes(cardId)) {
    return state.zones.victoryDisplay;
  }

  for (const player of state.players) {
    if (player.zones.discardPile.cards.includes(cardId)) {
      return player.zones.discardPile;
    }

    if (player.zones.engaged.cards.includes(cardId)) {
      return player.zones.engaged;
    }

    if (player.zones.hand.cards.includes(cardId)) {
      return player.zones.hand;
    }

    if (player.zones.library.cards.includes(cardId)) {
      return player.zones.library;
    }

    if (player.zones.playerArea.cards.includes(cardId)) {
      return player.zones.playerArea;
    }
  }

  throw new Error("404");
}

export const attachTo: (attachment: CardId) => CardAction = (attachmentId) => (targetId) =>
  action("attach attachment", (state) => {
    const attachment = state.cards.find((c) => c.id === attachmentId);
    if (attachment) {
      const targetZone = findZoneOf(targetId, state);
      const sourceZone = findZoneOf(attachmentId, state);
      sourceZone.cards = sourceZone.cards.filter((c) => c !== attachmentId);
      targetZone.cards.push(attachmentId);
      attachment.attachedTo = targetId;
      return "full";
    } else {
      return "none";
    }
  });

export function attachment(props: AttachmentProps, ...abilities: Ability[]): CardDefinition {
  const image = `https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Core-Set/${props.name
    .split(" ")
    .join("-")}.jpg`;
  return {
    face: {
      ...props,
      image,
      type: "attachment",
      keywords: emptyKeywords,
      abilities,
    },
    back: {
      image: playerBack,
      abilities: [],

      traits: [],
      keywords: emptyKeywords,
    },
    orientation: "portrait",
  };
}
