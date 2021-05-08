import { and, isInZone, isEnemy, Filter, isHero, isReady, withMaxEngagement } from "../filters";
import { PlayerId, CardId } from "../state";
import { zoneKey } from "../utils";
import { engagePlayer, resolveEnemyAttack, commitToQuest } from "./card";
import { chooseCardAction, chooseCardActionsOrder, chooseCardsActions } from "./choices";
import { repeat, sequence, action } from "./control";
import { moveTopCard } from "./game";
import { PlayerAction } from "./types";

export const draw = (amount: number) => (playerId: PlayerId) =>
  repeat(amount, moveTopCard(zoneKey("library", playerId), zoneKey("hand", playerId), "face"));

export function resolvePlayerAttacks(playerId: PlayerId) {
  // TODO all
  return sequence();
}

export const optionalEngagement: PlayerAction = (player) =>
  // TODO no engagement
  chooseCardAction(
    "Choose enemy to optionally engage",
    and(isInZone(zoneKey("stagingArea")), isEnemy),
    engagePlayer(player)
  );

export const engagementCheck: PlayerAction = (player) =>
  chooseCardAction("Choose enemy to engage", withMaxEngagement(player), engagePlayer(player));

export function resolveEnemyAttacks(playerId: PlayerId) {
  const enemies: Filter<CardId> = and(isEnemy, isInZone(zoneKey("engaged", playerId)));
  return chooseCardActionsOrder("Choose enemy attacker", enemies, resolveEnemyAttack(playerId));
}

export function incrementThreat(amount: number): PlayerAction {
  return (id) =>
    action(`player ${id}: increment threat by ${amount}`, (s) => {
      const player = s.players.find((p) => p.id === id);
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
    and(isHero, isReady, isInZone(zoneKey("playerArea", player))),
    commitToQuest
  );