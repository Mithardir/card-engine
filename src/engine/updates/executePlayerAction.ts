import { last, max, sum } from "lodash";
import {
  targetCard,
  chooseCard,
  payCardResources,
  repeat,
  targetPlayer,
  sequence,
  whileDo,
} from "../../factories/actions";
import { playerZone } from "../../factories/zones";
import {
  canPayResources,
  hasController,
  hasMark,
  isInZone,
} from "../../factories/cardFilters";
import { PlayerAction } from "../../types/actions";
import { PlayerFilter, PlayerId } from "../../types/basic";
import { State } from "../../types/state";
import { shuffleArray } from "../../utils";
import { evaluateNumber } from "../queries/evaluateNumber";
import { filterCards, mapCardViews } from "../queries/filterCards";
import { getPlayers } from "../queries/getPlayers";
import { getZone } from "../queries/getZone";
import { toView } from "../view/toView";
import { and, not } from "../../factories/predicates";
import {
  playerChooseCard,
  playerChooseCards,
} from "../../factories/playerActions";
import {
  dealDamage,
  engagePlayer,
  mark,
  resolveEnemyAttacking,
  resolvePlayerAttacking,
} from "../../factories/cardActions";
import { someCard } from "../../factories/boolValues";

export function executePlayerAction(
  state: State,
  filter: PlayerFilter,
  action: PlayerAction
) {
  const players = getPlayers(state, filter);

  for (const player of players) {
    if (typeof action === "string") {
      switch (action) {
        case "CommitCharactersToQuest": {
          state.next = [
            targetPlayer(player.id).to(
              playerChooseCards({
                action: "CommitToQuest",
                label: "Choose characters commiting to quest",
                filter: and(["isCharacter", hasController(player.id)]),
                optional: true,
              })
            ),
            ...state.next,
          ];

          break;
        }
        case "OptionalEngagement": {
          const choice = playerChooseCard({
            label: "Choose enemy to optionally engage",
            filter: and(["isEnemy", "inStagingArea"]),
            action: engagePlayer(player.id),
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
            action: engagePlayer(player.id),
            optional: false,
          });
          state.next = [targetPlayer(player.id).to(choose), ...state.next];
          break;
        }
        case "ResolveEnemyAttacks": {
          const attackerFilter = and([
            "isEnemy",
            not(hasMark("attacked")),
            isInZone(playerZone(player.id, "engaged")),
          ]);

          state.next = [
            whileDo(
              someCard(attackerFilter),
              chooseCard({
                label: "Choose enemy attacker",
                filter: attackerFilter,
                action: resolveEnemyAttacking(player.id),
                optional: false,
              })
            ),
            ...state.next,
          ];
          break;
        }
        case "ResolvePlayerAttacks": {
          const enemies = filterCards(
            state,
            and([
              "isEnemy",
              not(hasMark("attacked")),
              isInZone(playerZone(player.id, "engaged")),
            ])
          );

          const attackers = filterCards(
            state,
            and([
              "isReady",
              "isCharacter",
              isInZone(playerZone(player.id, "playerArea")),
            ])
          );

          if (enemies && attackers && attackers.length > 0) {
            state.next = [
              // TODO chooseAction
              chooseCard({
                label: "Choose enemy to attack",
                filter: enemies.map((e) => e.id),
                action: sequence(resolvePlayerAttacking(player.id)),
                optional: true,
              }),
              targetPlayer(player.id).to("ResolvePlayerAttacks"),
              ...state.next,
            ];
          }
          break;
        }
        case "DeclareDefender": {
          state.next = [
            chooseCard({
              label: "Declare defender",
              filter: and([
                "isReady",
                "isCharacter",
                isInZone(playerZone(player.id, "playerArea")),
              ]),
              action: sequence("Tap", mark("defending")),
              optional: true,
            }),
            ...state.next,
          ];
          break;
        }
        case "DetermineCombatDamage": {
          const defending = filterCards(state, hasMark("defending"));

          const attack = sum(
            mapCardViews(
              state,
              hasMark("attacking"),
              (v) => v.props.attack || 0
            )
          );

          const defense = sum(
            mapCardViews(
              state,
              hasMark("defending"),
              (v) => v.props.defense || 0
            )
          );

          if (defending.length === 0) {
            state.next = [
              chooseCard({
                label: "Choose hero for undefended attack",
                filter: and([
                  "isHero",
                  isInZone(playerZone(player.id, "playerArea")),
                ]),
                action: dealDamage(attack),
                optional: false,
              }),
              ...state.next,
            ];
          } else {
            const damage = attack - defense;
            if (damage > 0) {
              if (defending.length === 1) {
                state.next = [
                  targetCard(defending[0].id).to(dealDamage(damage)),
                  ...state.next,
                ];
              } else {
                // TODO multiple defenders
              }
            }
          }
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
