import produce from "immer";
import { shuffleArray } from "../utils";
import { Exp } from "./filters";
import { PlayerDeck, Scenario } from "./setup";
import { CardId, createCardState, GameZoneType, PlayerId, playerIds, PlayerZoneType, Side } from "./state";
import { Command, CommandResult, Token, ZoneKey } from "./types";
import { getZone, mergeAndResults } from "./utils";
import { createView } from "./view";

export function zoneKey(type: PlayerZoneType, player: PlayerId): ZoneKey;
export function zoneKey(type: GameZoneType): ZoneKey;
export function zoneKey(type: PlayerZoneType | GameZoneType, player?: PlayerId): ZoneKey {
  return {
    type,
    player,
    print: player ? `${type} of player ${player}` : type,
  } as ZoneKey;
}

export function moveTopCard(from: ZoneKey, to: ZoneKey, side: Side): Command {
  return {
    print: `move to card from ${from.print} to ${to.print} with ${side} side up`,
    do: (s) => {
      const fromZone = getZone(from)(s);
      const toZone = getZone(to)(s);
      if (fromZone.cards.length > 0) {
        const cardId = fromZone.cards.pop()!;
        const card = s.cards.find((c) => c.id === cardId)!;
        card.sideUp = side;
        toZone.cards.push(cardId);
      }
    },
    result: (s) => {
      return getZone(from)(s).cards.length > 0 ? "full" : "none";
    },
  };
}

export function moveCard(cardId: CardId, from: ZoneKey, to: ZoneKey, side: Side): Command {
  return {
    print: `move to card ${cardId} from ${from.print} to ${to.print} with ${side} side up`,
    do: (s) => {
      const fromZone = getZone(from)(s);
      const toZone = getZone(to)(s);
      if (fromZone.cards.includes(cardId)) {
        fromZone.cards = fromZone.cards.filter((c) => c !== cardId);
        const card = s.cards.find((c) => c.id === cardId)!;
        card.sideUp = side;
        toZone.cards.push(cardId);
      }
    },
    result: (s) => {
      return getZone(from)(s).cards.includes(cardId) ? "full" : "none";
    },
  };
}

export function addToken(cardId: CardId, type: Token): Command {
  return {
    print: `add ${type} token to card ${cardId}`,
    do: (s) => {
      s.cards.find((c) => c.id === cardId)![type] += 1;
    },
    result: () => "full",
  };
}

export function removeToken(cardId: CardId, type: Token): Command {
  return {
    print: `remove ${type} token from card ${cardId}`,
    do: (s) => {
      const card = s.cards.find((c) => c.id === cardId)!;
      if (card[type] >= 1) {
        card[type] -= 1;
      }
    },
    result: (s) => {
      const card = s.cards.find((c) => c.id === cardId)!;
      return card[type] >= 1 ? "full" : "none";
    },
  };
}

export function repeat(amountExp: Exp<number>, cmd: Command): Command {
  return {
    print: `repeat ${amountExp.print}x: [${cmd.print}]`,
    do: (s) => {
      const amount = amountExp.eval(createView(s));
      for (let index = 0; index < amount; index++) {
        cmd.do(s);
      }
    },
    result: (init) => {
      const amount = amountExp.eval(createView(init));
      const results: CommandResult[] = [];
      produce(init, (draft) => {
        for (let index = 0; index < amount; index++) {
          results.push(cmd.result(draft));
          cmd.do(draft);
        }
      });

      return mergeAndResults(...results);
    },
  };
}

export function setupScenario(scenario: Scenario): Command {
  return {
    print: `setup scenario ${scenario.name}`,
    do: (s) => {
      const quest = scenario.questCards.map((q, index) => createCardState(index * 5 + 5, q, "back"));
      const cards = scenario.encounterCards.map((e, index) =>
        createCardState((index + quest.length) * 5 + 5, e, "back")
      );

      s.zones.encounterDeck.cards.push(...cards.map((c) => c.id));
      s.zones.questDeck.cards.push(...quest.map((c) => c.id));

      s.cards.push(...quest, ...cards);
    },
    result: () => "full",
  };
}

export function addPlayer(playerId: PlayerId, deck: PlayerDeck): Command {
  return {
    print: `add player ${playerId} with deck ${deck.name}`,
    do: (s) => {
      const playerIndex = playerIds.findIndex((p) => p === playerId);
      const heroes = deck.heroes.map((h, index) => createCardState(index * 5 + playerIndex + 1, h, "face"));
      const library = deck.library.map((l, index) =>
        createCardState((index + heroes.length) * 5 + playerIndex + 1, l, "back")
      );

      s.players.push({
        id: playerId,
        thread: heroes.map((h) => h.definition.face.threatCost!).reduce((p, c) => p + c, 0),
        zones: {
          hand: { cards: [], stack: false },
          library: { cards: library.map((l) => l.id), stack: true },
          playerArea: { cards: heroes.map((h) => h.id), stack: false },
          discardPile: { cards: [], stack: true },
          engaged: { cards: [], stack: false },
        },
      });

      s.cards.push(...heroes, ...library);
    },
    result: () => "full",
  };
}

export function shuffleZone(zoneKey: ZoneKey): Command {
  return {
    print: `shuffle ${zoneKey.print}`,
    do: (s) => {
      shuffleArray(getZone(zoneKey)(s).cards);
    },
    result: () => "full",
  };
}

export function batch(...cmds: Command[]): Command {
  return {
    print: `batch\r\n ${cmds.map((c) => `\t${c.print}`).join("\r\n")}`,
    do: (s) => {
      for (const cmd of cmds) {
        cmd.do(s);
      }
    },
    result: (init) => {
      const results: CommandResult[] = [];
      produce(init, (draft) => {
        for (const cmd of cmds) {
          results.push(cmd.result(draft));
          cmd.do(draft);
        }
      });
      return mergeAndResults(...results);
    },
  };
}

export function tap(cardId: CardId): Command {
  return {
    print: `tap card ${cardId}`,
    do: (s) => {
      s.cards.find((c) => c.id === cardId)!.tapped = true;
    },
    result: (s) => {
      return s.cards.find((c) => c.id === cardId)!.tapped ? "none" : "full";
    },
  };
}

export function untap(cardId: CardId): Command {
  return {
    print: `untap card ${cardId}`,
    do: (s) => {
      s.cards.find((c) => c.id === cardId)!.tapped = false;
    },
    result: (s) => {
      return s.cards.find((c) => c.id === cardId)!.tapped ? "full" : "none";
    },
  };
}

export function assignToQuest(cardId: CardId): Command {
  return {
    print: `assign to quest card ${cardId}`,
    do: (s) => {
      s.cards.find((c) => c.id === cardId)!.commitedToQuest = true;
    },
    result: (s) => {
      return s.cards.find((c) => c.id === cardId)!.commitedToQuest ? "none" : "full";
    },
  };
}

export const noCommand: Command = {
  print: "noCommand",
  do: async () => {},
  result: () => "full",
};

export function setFirstPlayer(id: PlayerId): Command {
  return {
    print: `set first player to ${id}`,
    do: (s) => {
      s.firstPlayer = id;
    },
    result: () => "full",
  };
}
