import { negate } from "../exps";
import {
  and,
  isInZone,
  isEnemy,
  Filter,
  isReady,
  withMaxEngagement,
  isCharacter,
  hasNotMark,
  isTapped,
  isHero,
  hasMark,
  hasToken,
} from "../filters";
import { PlayerId, CardId } from "../state";
import { Sphere } from "../types";
import { filterCards, zoneKey } from "../utils";
import { createView } from "../view";
import { engagePlayer, resolveEnemyAttack, commitToQuest, resolvePlayerAttack, removeToken } from "./card";
import { chooseCardAction, chooseCardActionsOrder, chooseCardsActions, chooseOne } from "./choices";
import { repeat, action, sequence } from "./control";
import { moveTopCard } from "./game";
import { Action, PlayerAction } from "./types";

export const draw = (amount: number) => (playerId: PlayerId) =>
  repeat(amount, moveTopCard(zoneKey("library", playerId), zoneKey("hand", playerId), "face"));

export function resolvePlayerAttacks(playerId: PlayerId): Action {
  const enemiesFiler: Filter<CardId> = and(isEnemy, hasNotMark("attacked"), isInZone(zoneKey("engaged", playerId)));
  const attackersFilter = and((id) => negate(isTapped(id)), isCharacter, isInZone(zoneKey("playerArea", playerId)));
  return {
    print: `resolvePlayerAttacks(${playerId})`,
    do: (s) => {
      const view = createView(s);
      const cards = filterCards(enemiesFiler, view);
      const attackers = filterCards(attackersFilter, view);

      if (attackers.length === 0) {
        return sequence().do(s);
      }

      const choice = chooseOne("Choose enemy to attack", [
        ...cards.map((c) => ({
          action: sequence(resolvePlayerAttack(playerId)(c.id), resolvePlayerAttacks(playerId)),
          label: c.props.name || "",
          image: c.props.image,
        })),
        {
          action: sequence(),
          label: "Stop attacking",
        },
      ]);

      return choice.do(s);
    },
  };

  // return sequence(
  //   chooseCardActionsOrder("Choose enemy to attack", enemies, resolvePlayerAttack(playerId)),
  //   clearMarks("attacked")
  // );
}

export const optionalEngagement: PlayerAction = (player) => ({
  print: "optionalEngagement",
  do: (state) => {
    const view = createView(state);
    const cards = filterCards(and(isInZone(zoneKey("stagingArea")), isEnemy), view);

    if (cards.length === 0) {
      return sequence().do(state);
    }

    const action = chooseOne("Choose enemy to optionally engage", [
      ...cards.map((c) => ({
        image: c.props.image,
        label: c.props.name || "",
        action: engagePlayer(player)(c.id),
      })),
      {
        label: "No enemy",
        action: sequence(),
      },
    ]);

    return action.do(state);
  },
});

export const engagementCheck: PlayerAction = (player) =>
  chooseCardAction("Choose enemy to engage", withMaxEngagement(player), engagePlayer(player));

export function resolveEnemyAttacks(playerId: PlayerId) {
  const enemies: Filter<CardId> = and(isEnemy, isInZone(zoneKey("engaged", playerId)));
  return chooseCardActionsOrder("Choose enemy attacker", enemies, resolveEnemyAttack(playerId));
}

export function incrementThreat(amount: number): PlayerAction {
  return (playerId) =>
    action(`incrementThreat(${amount}, ${playerId})`, (s) => {
      const player = s.players.find((p) => p.id === playerId);
      if (player) {
        player.thread += amount;
        return "full";
      } else {
        return "none";
      }
    });
}

export const commitCharactersToQuest: PlayerAction = (player) =>
  chooseCardsActions(
    "Commit characters to quest",
    and(isCharacter, isReady, isInZone(zoneKey("playerArea", player))),
    commitToQuest
  );

export function payResources(amount: number, sphere: Sphere): PlayerAction {
  //TODO check sphere
  return (player) => ({
    print: `payResources(${amount}, ${sphere})`,
    do: (s) => {
      const heroes = and(isHero, hasToken("resources"), isInZone(zoneKey("playerArea", player)));
      const action = chooseCardAction(`Choose hero to pay ${sphere} resource`, heroes, (card) =>
        sequence(removeToken("resources")(card), amount > 1 ? payResources(amount - 1, sphere)(player) : sequence())
      );

      return action.do(s);
    },
  });
}
