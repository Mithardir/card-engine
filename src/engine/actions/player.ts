import { and, isInZone, isEnemy, Filter, isReady, withMaxEngagement, isCharacter } from "../filters";
import { PlayerId, CardId } from "../state";
import { filterCards, zoneKey } from "../utils";
import { createView } from "../view";
import { engagePlayer, resolveEnemyAttack, commitToQuest, resolvePlayerAttack } from "./card";
import { chooseCardAction, chooseCardActionsOrder, chooseCardsActions, chooseOne } from "./choices";
import { repeat, action, sequence } from "./control";
import { moveTopCard } from "./game";
import { PlayerAction } from "./types";

export const draw = (amount: number) => (playerId: PlayerId) =>
  repeat(amount, moveTopCard(zoneKey("library", playerId), zoneKey("hand", playerId), "face"));

export function resolvePlayerAttacks(playerId: PlayerId) {
  const enemies: Filter<CardId> = and(isEnemy, isInZone(zoneKey("engaged", playerId)));
  return chooseCardActionsOrder("Choose enemy to attack", enemies, resolvePlayerAttack(playerId));
}

export const optionalEngagement: PlayerAction = (player) => ({
  print: "optionalEngagement",
  do: (state) => {
    const view = createView(state);
    const cards = filterCards(and(isInZone(zoneKey("stagingArea")), isEnemy), view);

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
