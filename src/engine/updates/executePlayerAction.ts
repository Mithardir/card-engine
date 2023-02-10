import { last, max } from "lodash";
import {
  targetCard,
  chooseCard,
  payCardResources,
  repeat,
  targetPlayer,
} from "../../factories/actions";
import { playerZone } from "../../factories/zones";
import { canPayResources } from "../../factories/cardFilters";
import { PlayerAction } from "../../types/actions";
import { PlayerFilter, PlayerId } from "../../types/basic";
import { State } from "../../types/state";
import { shuffleArray } from "../../utils";
import { evaluateNumber } from "../queries/evaluateNumber";
import { filterCards } from "../queries/filterCards";
import { getPlayers } from "../queries/getPlayers";
import { getZone } from "../queries/getZone";
import { toView } from "../view/toView";
import { and } from "../../factories/predicates";
import { playerChooseCard } from "../../factories/playerActions";

export function executePlayerAction(
  state: State,
  filter: PlayerFilter,
  action: PlayerAction | ((player: PlayerId) => PlayerAction)
) {
  const players = getPlayers(state, filter);

  if (typeof action === "function") {
    for (const player of players) {
      state.next.unshift({
        type: "PlayerAction",
        player: player.id,
        action: action(player.id),
      });
    }

    return;
  }

  for (const player of players) {
    if (typeof action === "string") {
      switch (action) {
        case "OptionalEngagement": {
          const choice = playerChooseCard({
            label: "Choose enemy to optionally engage",
            filter: and(["isEnemy", "inStagingArea"]),
            action: { type: "EngagePlayer", player: player.id },
            optional: true,
          });
          state.next = [targetPlayer(player.id).to(choice), ...state.next];
          break;
        }
        case "EngagementCheck": {
          const threat = player.thread;
          const view = toView(state);
          const enemies = filterCards(
            state,
            and(["isEnemy", "inStagingArea"])
          ).map((s) => view.cards[s.id]);

          const maxEngagement = max(
            enemies
              .filter((e) => e.props.engagement && e.props.engagement <= threat)
              .map((e) => e.props.engagement)
          );

          if (maxEngagement === undefined) {
            break;
          }

          const enemyChoices = enemies.filter(
            (e) => e.props.engagement === maxEngagement
          );

          const choose = playerChooseCard({
            label: "Choose enemy to engage",
            filter: enemyChoices.map((e) => e.id),
            action: { type: "EngagePlayer", player: player.id },
            optional: false,
          });
          state.next = [targetPlayer(player.id).to(choose), ...state.next];
          break;
        }
      }

      break;
    }

    switch (action.type) {
      case "ShuffleZone": {
        const zone = getZone(playerZone(player.id, action.zone), state);
        shuffleArray(zone.cards);
        break;
      }
      case "Draw": {
        const amount = evaluateNumber(action.amount, state);
        for (let index = 0; index < amount; index++) {
          const top = last(player.zones.library.cards);
          if (top) {
            state.cards[top].sideUp = "face";
            player.zones.library.cards.pop();
            player.zones.hand.cards.push(top);
          }
        }
        break;
      }
      case "ChooseCard": {
        const view = toView(state);
        const cards = filterCards(state, action.filter);
        const options = cards.map((c) => ({
          action: targetCard(c.id).to(action.action),
          image: c.definition.face.image,
          title: view.cards[c.id].props.name || "Unknown card",
        }));

        if (options.length === 0 && action.optional) {
          break;
        }

        state.choice = {
          dialog: true,
          multi: action.multi,
          title: action.label,
          options:
            action.optional && !action.multi
              ? [...options, { title: "None", action: "Empty" }]
              : options,
        };
        break;
      }
      case "IncrementThreat": {
        player.thread += evaluateNumber(action.amount, state);
        break;
      }
      case "PayResources": {
        const sphere = action.sphere;
        state.next = [
          repeat(
            action.amount,
            chooseCard({
              label: `Pay 1 ${sphere} sphere resource`,
              filter: canPayResources(1, action.sphere),
              action: payCardResources(1),
              optional: false,
            })
          ),
          ...state.next,
        ];

        break;
      }
      default: {
        throw new Error(`unknown player action: ${JSON.stringify(action)}`);
      }
    }
  }
}
