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

export const resolveEnemyAttacks = playerAction("resolveEnemyAttacks", (c) => {
  const attackers = and(
    isEnemy,
    not(hasMark("attacked")),
    isInZone(playerZone("engaged", c.player.id))
  );

  c.run(
    whileDo(
      someCards(attackers),
      chooseCardAction(
        "Choose enemy attacker",
        attackers,
        resolveEnemyAttack(c.player.id),
        false
      )
    )
  );
});

export const optionalEngagement = playerAction("optionalEngagement", (c) => {
  c.run(
    chooseCardAction(
      "Choose enemy to optionally engage",
      and(isEnemy, isInZone(gameZone("stagingArea"))),
      moveCard({
        from: gameZone("stagingArea"),
        to: playerZone("engaged", c.player.id),
        side: "face",
      }),
      true
    )
  );
});

export const shuffleLibrary = playerAction("shuffleLibrary", (c) => {
  c.run(shuffleZone(playerZone("library", c.player.id)));
});

export const resolvePlayerAttacks = playerAction(
  "resolvePlayerAttacks",
  (context) => {
    const enemies = context.get(
      filterCards(
        and(
          isEnemy,
          not(hasMark("attacked")),
          isInZone(playerZone("engaged", context.player.id))
        )
      )
    );

    const attackers = context.get(
      filterCards(
        and(
          isReady,
          isCharacter,
          isInZone(playerZone("playerArea", context.player.id))
        )
      )
    );

    if (enemies && attackers && attackers.length > 0) {
      context.run(
        chooseOne("Choose enemy attacker", [
          ...enemies.map((c) => ({
            action: sequence(
              resolvePlayerAttack(context.player.id).card(c.id),
              resolvePlayerAttacks().player(context.player.id)
            ),
            title: c.props.name || "",
            image: c.props.image,
          })),
          {
            action: sequence(),
            title: "Stop attacking",
          },
        ])
      );
    }
  }
);
