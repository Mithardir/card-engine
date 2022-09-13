import { PlayerId } from "../../types/state";
import {
  and,
  isCharacter,
  isReady,
  isInZone,
  withMaxEngagement,
  isEnemy,
  not,
  hasMark,
  someCards,
  filterCards,
} from "../filters";
import { playerZone, gameZone } from "../getters";
import { PlayerAction, Getter, Action } from "../types";
import {
  commitToQuest,
  moveCard,
  resolveEnemyAttack,
  resolvePlayerAttack,
} from "./card";
import {
  playerDraw,
  chooseCardsActions,
  chooseCardAction,
  whileDo,
  shuffleZone,
  chooseOne,
  sequence,
} from "./global";

export function draw(amount: number): PlayerAction {
  return {
    print: `draw(${amount})`,
    player: (id) => playerDraw(id, amount),
  };
}

export function incrementThreat(
  amount: Getter<number>,
  playerId?: PlayerId
): PlayerAction & Action {
  return {
    print: `incrementThreat(${amount.print}, ${playerId})`,
    player: (id) => incrementThreat(amount, id),
    apply: (s) => {
      if (playerId) {
        const player = s.players[playerId];
        const inc = amount.get(s);
        if (player && inc) {
          player.thread += inc;
        }
      }
    },
  };
}

export const commitCharactersToQuest: PlayerAction = {
  print: `commitCharactersToQuest`,
  player: (player) =>
    chooseCardsActions(
      "Commit characters to quest",
      and(isCharacter, isReady, isInZone(playerZone("playerArea", player))),
      commitToQuest
    ),
};

export function engagementCheck(player?: PlayerId): Action & PlayerAction {
  return {
    print: `engagementCheck(${player})`,
    player: (id) => engagementCheck(id),
    apply: (s) => {
      if (player) {
        chooseCardAction(
          "Choose enemy to engage",
          and(withMaxEngagement(player), isInZone(gameZone("stagingArea"))),
          moveCard({
            from: gameZone("stagingArea"),
            to: playerZone("engaged", player),
            side: "face",
          }),
          false
        ).apply(s);
      }
    },
  };
}

export function resolveEnemyAttacks(player?: PlayerId): Action & PlayerAction {
  return {
    print: `resolveEnemyAttacks(${player})`,
    player: (id) => resolveEnemyAttacks(id),
    apply: (s) => {
      if (player) {
        const attackers = and(
          isEnemy,
          not(hasMark("attacked")),
          isInZone(playerZone("engaged", player))
        );

        whileDo(
          someCards(attackers),
          chooseCardAction(
            "Choose enemy attacker",
            attackers,
            resolveEnemyAttack(player),
            false
          )
        ).apply(s);
      }
    },
  };
}

export function optionalEngagement(player?: PlayerId): Action & PlayerAction {
  return {
    print: `optionalEngagement(${player})`,
    player: (id) => optionalEngagement(id),
    apply: (s) => {
      if (player) {
        chooseCardAction(
          "Choose enemy to optionally engage",
          and(isEnemy, isInZone(gameZone("stagingArea"))),
          moveCard({
            from: gameZone("stagingArea"),
            to: playerZone("engaged", player),
            side: "face",
          }),
          true
        ).apply(s);
      }
    },
  };
}

export const shuffleLibrary: PlayerAction = {
  print: "shuffleLibrary",
  player: (player) => shuffleZone(playerZone("library", player)),
};

export function resolvePlayerAttacks(player?: PlayerId): Action & PlayerAction {
  return {
    print: `resolvePlayerAttacks(${player})`,
    player: (id) => resolvePlayerAttacks(id),
    apply: (s) => {
      if (player) {
        const enemies = filterCards(
          and(
            isEnemy,
            not(hasMark("attacked")),
            isInZone(playerZone("engaged", player))
          )
        ).get(s);

        const attackers = filterCards(
          and(isReady, isCharacter, isInZone(playerZone("playerArea", player)))
        ).get(s);

        if (enemies && attackers && attackers.length > 0) {
          chooseOne("Choose enemy attacker", [
            ...enemies.map((c) => ({
              action: sequence(
                resolvePlayerAttack(player).card(c.id),
                resolvePlayerAttacks(player)
              ),
              title: c.props.name || "",
              image: c.props.image,
            })),
            {
              action: sequence(),
              title: "Stop attacking",
            },
          ]).apply(s);
        }
      }
    },
  };
}
