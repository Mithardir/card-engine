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
  isHero,
  canAttack,
} from "../filters";
import {
  playerZone,
  gameZone,
  topCard,
  attackers,
  defenders,  
  totalAttack,
  totalDefense,
  value,
} from "../getters";
import { Getter, PlayerAction } from "../types";
import { moveCard } from "./basic";
import { commitToQuest, resolveEnemyAttack, resolvePlayerAttack } from "./card";
import { dealDamage } from "./card/dealDamage";
import { playerAction } from "./factories";
import {
  chooseCardsActions,
  chooseCardAction,
  whileDo,
  shuffleZone,
  chooseOne,
  sequence,
  repeat,
} from "./global";

export const draw = playerAction<number>(
  "draw",
  (c, amount) => {
    return repeat(
      value(amount),
      moveCard({
        from: playerZone("library", c.player.id),
        to: playerZone("hand", c.player.id),
        side: "face",
      }).card(topCard(playerZone("library", c.player.id)))
    );
  },
  (p, state, amount) => {
    const cards = p.zones.library.cards.length;
    if (cards === 0) {
      return "none";
    }

    if (cards >= amount) {
      return "full";
    }

    return "partial";
  }
);

export const incrementThreat = playerAction<Getter<number>>(
  "incrementThreat",
  (c, amount) => {
    c.player.thread += c.get(amount);
    return sequence();
  }
);

export const commitCharactersToQuest = playerAction(
  "commitCharactersToQuest",
  (c) => {
    return chooseCardsActions(
      "Commit characters to quest",
      and(
        isCharacter,
        isReady,
        isInZone(playerZone("playerArea", c.player.id))
      ),
      commitToQuest
    );
  }
);

export const engagementCheck = playerAction("engagementCheck", (c) => {
  return chooseCardAction(
    "Choose enemy to engage",
    and(withMaxEngagement(c.player.id), isInZone(gameZone("stagingArea"))),
    moveCard({
      from: gameZone("stagingArea"),
      to: playerZone("engaged", c.player.id),
      side: "face",
    }),
    false
  );
});

export const resolveEnemyAttacks = playerAction("resolveEnemyAttacks", (c) => {
  const attackers = and(
    isEnemy,
    not(hasMark("attacked")),
    isInZone(playerZone("engaged", c.player.id)),
    canAttack(c.player.id)
  );

  return whileDo(
    someCards(attackers),
    chooseCardAction(
      "Choose enemy attacker",
      attackers,
      resolveEnemyAttack(c.player.id),
      false
    )
  );
});

export const determineCombatDamage = playerAction<"defend" | "attack">(
  "determineCombatDamage",
  (c, phase) => {
    const attacking = c.get(attackers);
    const defending = c.get(defenders);
    const attack = c.get(totalAttack);
    const defense = c.get(totalDefense);

    if (phase === "defend" && defending.length === 0) {
      return chooseCardAction(
        "Choose hero for undefended attack",
        and(isHero, isInZone(playerZone("playerArea", c.player.id))),
        dealDamage({
          damage: value(attack),
          attackers: value(attacking),
        }),
        false
      );
    } else {
      const damage = attack - defense;
      if (damage > 0) {
        if (defending.length === 1) {
          return dealDamage({
            damage: value(damage),
            attackers: value(attacking),
          }).card(defending[0]);
        } else {
          // todo multiple defenders
        }
      }
    }

    return sequence();
  }
);

export const optionalEngagement = playerAction("optionalEngagement", (c) => {
  return chooseCardAction(
    "Choose enemy to optionally engage",
    and(isEnemy, isInZone(gameZone("stagingArea"))),
    moveCard({
      from: gameZone("stagingArea"),
      to: playerZone("engaged", c.player.id),
      side: "face",
    }),
    true
  );
});

export const shuffleLibrary = playerAction("shuffleLibrary", (c) => {
  return shuffleZone(playerZone("library", c.player.id));
});

export const resolvePlayerAttacks: () => PlayerAction = playerAction(
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
      return chooseOne("Choose enemy attacker", [
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
      ]);
    }

    return sequence();
  }
);
