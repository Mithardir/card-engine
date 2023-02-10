import { gameZone, playerZone } from "../../factories/zones";
import { CardAction } from "../../types/actions";
import { CardFilter } from "../../types/basic";
import { State } from "../../types/state";
import { evaluateNumber } from "../queries/evaluateNumber";
import { filterCards } from "../queries/filterCards";
import { moveCard } from "./moveCard";

export function executeCardAction(
  state: State,
  filter: CardFilter,
  action: CardAction
) {
  const cards = filterCards(state, filter);
  for (const card of cards) {
    if (typeof action === "string") {
      switch (action) {
        case "CommitToQuest":
          card.tapped = true;
          card.mark.questing = true;
          break;
        case "Tap":
          card.tapped = true;
          break;
        case "Untap":
          card.tapped = false;
          break;
        case "TravelTo":
          moveCard(state, card.id, gameZone("activeLocation"));
          break;
        case "Discard":
          if (card.owner === "game") {
            moveCard(state, card.id, gameZone("discardPile"));
          } else {
            moveCard(state, card.id, playerZone(card.owner, "discardPile"));
          }
          break;
      }
    } else {
      switch (action.type) {
        case "Flip": {
          card.sideUp = action.side;
          break;
        }
        case "AddResources": {
          card.token.resources += evaluateNumber(action.amount, state);
          break;
        }
        case "PayResources": {
          card.token.resources = Math.max(
            0,
            card.token.resources - evaluateNumber(action.amount, state)
          );
          break;
        }
        case "Heal": {
          if (action.amount === "all") {
            card.token.damage = 0;
          } else {
            const amount = evaluateNumber(action.amount, state);
            card.token.damage = Math.max(0, card.token.damage - amount);
          }
          break;
        }
        case "DealDamage": {
          card.token.damage += evaluateNumber(action.amount, state);
          break;
        }
        case "EngagePlayer": {
          moveCard(state, card.id, playerZone(action.player, "engaged"));
          break;
        }
        default: {
          throw new Error(`unknown card action: ${JSON.stringify(action)}`);
        }
      }
    }
  }
}
