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
import { playerZone, gameZone, topCard } from "../getters";
import { PlayerAction, Getter, Action } from "../types";
import {
  cardActionSequence,
  commitToQuest,
  flip,
  moveCard,
  resolveEnemyAttack,
  resolvePlayerAttack,
} from "./card";
import { playerAction } from "./factories";
import {
  chooseCardsActions,
  chooseCardAction,
  whileDo,
  shuffleZone,
  chooseOne,
  sequence,
} from "./global";

export const draw = playerAction<number>("draw", (c, amount) => {
  for (let index = 0; index < amount; index++) {
    c.run(
      moveCard({
        from: playerZone("library", c.player.id),
        to: playerZone("hand", c.player.id),
        side: "face",
      }).card(topCard(playerZone("library", c.player.id)))
    );
  }
});

export const incrementThreat = playerAction<Getter<number>>(
  "incrementThreat",
  (c, amount) => {
    c.player.thread += c.get(amount);
  }
);

export const commitCharactersToQuest = playerAction(
  "commitCharactersToQuest",
  (c) => {
    c.run(
      chooseCardsActions(
        "Commit characters to quest",
        and(
          isCharacter,
          isReady,
          isInZone(playerZone("playerArea", c.player.id))
        ),
        commitToQuest
      )
    );
  }
);

export const engagementCheck = playerAction("engagementCheck", (c) => {
  c.run(
    chooseCardAction(
      "Choose enemy to engage",
      and(withMaxEngagement(c.player.id), isInZone(gameZone("stagingArea"))),
      moveCard({
        from: gameZone("stagingArea"),
        to: playerZone("engaged", c.player.id),
        side: "face",
      }),
      false
    )
  );
});

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
