import {
  addPlayer,
  addToken,
  assignToQuest,
  batch,
  moveCard,
  moveTopCard,
  noCommand,
  repeat,
  repeat2,
  setFirstPlayer,
  setupScenario,
  shuffleZone,
  tap,
  untap,
  zoneKey,
} from "./commands";
import {
  and,
  countOfPlayers,
  diff,
  enemiesToEngage,
  Exp,
  Filter,
  filterCards,
  getProp,
  isCharacter,
  isEnemy,
  isHero,
  isInZone,
  isLess,
  isLocation,
  isMore,
  isTapped,
  existsActiveLocation,
  lit,
  negate,
  nextPlayerId,
  totalThread,
  totalWillpower,
  withMaxEngegament as withMaxEngagement,
} from "./filters";
import { Scenario, PlayerDeck } from "./setup";
import { CardId, PlayerId, playerIds } from "./state";
import { Action, cardAction, CardAction, CardAction2, Command, PlayerAction } from "./types";
import { CardView, createView } from "./view";
import { PowerSet } from "js-combinatorics";
import { getActionResult } from "./engine";

export const draw: (amount: number) => PlayerAction = (amount) => (player) => {
  return action(
    repeat(lit(amount), moveTopCard(zoneKey("library", player), zoneKey("hand", player), "face")),
    `player ${player} draws ${amount} cards`
  );
};

export function action(cmd: Command, print?: string): Action {
  return {
    print: print ?? cmd.print,
    do: async (e) => e.exec(cmd),
    commands: () => [{ first: cmd, next: [] }],
  };
}

export function cardActionSequence(...actions: CardAction2[]): CardAction2 {
  return {
    type: "card_action",
    print: `sequence: \r\n${actions.map((a) => "\t" + a.print).join("\r\n")}`,
    action: (cardId) => sequence(...actions.map((a) => a.action(cardId))),
  };
}

export function sequence(...actions: Action[]): Action {
  return {
    print: `sequence: \r\n${actions.map((a) => "\t" + a.print).join("\r\n")}`,
    do: async (engine) => {
      for (const act of actions) {
        await engine.do(act);
      }
    },
    commands: (s) => {
      if (actions.length === 0) {
        return [{ first: noCommand, next: [] }];
      }
      const cmds = actions[0].commands(s);
      return cmds.map((c) => {
        return { first: c.first, next: [...c.next, ...actions.slice(1)] };
      });
    },
  };
}

export function choosePlayerForAct(player: PlayerId, factory: (id: PlayerId) => Action): Action {
  return {
    print: `choose player for action: [${factory("X").print}]`,
    do: async (engine) => {
      const actions = engine.state.players.map((p) => ({ label: p.id.toString(), value: factory(p.id) }));
      await engine.chooseNextAction("Choose player", actions);
    },
    commands: (s) => {
      return s.players.flatMap((p) => factory(p.id).commands(s));
    },
  };
}

export const noAction: Action = {
  print: "no action",
  do: async () => {},
  commands: () => [],
};

export function beginScenario(scenario: Scenario, ...decks: PlayerDeck[]): Action {
  return sequence(
    action(
      batch(
        setupScenario(scenario),
        ...decks.map((d, i) => addPlayer(playerIds[i], d)),
        shuffleZone(zoneKey("encounterDeck"))
      )
    ),
    eachPlayer((p) => action(shuffleZone(zoneKey("library", p)))),
    eachPlayer(draw(6)),
    action(moveTopCard(zoneKey("questDeck"), zoneKey("quest"), "face"))
  );
}

export function eachPlayer(factory: PlayerAction): Action {
  // TODO order
  return {
    print: `each player: ${factory("X").print}`,
    do: async (engine) => {
      const action = sequence(...engine.state.players.map((p) => factory(p.id)));
      await action.do(engine);
    },
    commands: (s) => sequence(...s.players.map((p) => factory(p.id))).commands(s),
  };
}

export function eachCard(filter: Filter<CardId>, action: CardAction): Action {
  return {
    print: `each card that ${filter(0).print}: ${action(0).print}`,
    do: async (engine) => {
      const view = createView(engine.state);
      const cards = filterCards(filter, view);
      const actions = sequence(...cards.map((card) => action(card.id)));
      actions.do(engine);
    },
    commands: (s) => {
      const view = createView(s);
      const cards = filterCards(filter, view);
      return sequence(...cards.map((card) => action(card.id))).commands(s);
    },
  };
}

export function generateResource(amount: number): CardAction {
  return (id) => action(repeat(lit(amount), addToken(id, "resources")));
}

export function phaseResource(): Action {
  return sequence(eachPlayer(draw(1)), eachCard(isHero, generateResource(1)), playerActions("End phase"));
}

export function phasePlanning(): Action {
  //  TODO set phase to game
  return playerActions("End phase");
}

export function commitToQuest(cardId: CardId): Action {
  return sequence(action(tap(cardId)), action(assignToQuest(cardId)));
}

export function repeatAction(amountExp: Exp<number>, action: Action): Action {
  return {
    print: `repeat ${amountExp.print}x: [${action}]`,
    do: async (e) => {
      const amount = amountExp.eval(createView(e.state));
      return sequence(...new Array(amount).fill(0).map(() => action)).do(e);
    },
    commands: (s) => {
      const amount = amountExp.eval(createView(s));
      return sequence(...new Array(amount).fill(0).map(() => action)).commands(s);
    },
  };
}

export const commitCharactersToQuest: PlayerAction = (player) =>
  chooseCardsForAction(and(isHero, isInZone(zoneKey("playerArea", player))), commitToQuest);

export function phaseQuest(): Action {
  return sequence(
    eachPlayer(commitCharactersToQuest),
    playerActions("Staging"),
    repeatAction(countOfPlayers, action(moveTopCard(zoneKey("encounterDeck"), zoneKey("stagingArea"), "face"))),
    playerActions("Quest resolution"),
    ifThen(
      isLess(totalWillpower, totalThread),
      eachPlayer((p) => action(incrementThreat(diff(totalThread, totalWillpower))(p)))
    ),
    ifThen(isMore(totalWillpower, totalThread), placeProgress(diff(totalWillpower, totalThread))),
    playerActions("End phase")
  );
}

export function placeProgress(amount: Exp<number>): Action {
  return {
    // TODO location -> quest
    print: `place (${amount.print}) progress to active location`,
    do: async (e) => {
      const card = e.state.zones.quest.cards[0];
      const cmd = repeat(amount, addToken(card, "progress"));
      e.exec(cmd);
    },
    // TODO
    commands: (s) => {
      const card = s.zones.quest.cards[0];
      const cmd = repeat(amount, addToken(card, "progress"));
      return [{ first: cmd, next: [] }];
    },
  };
}

export function incrementThreat(amount: Exp<number>): (playerId: PlayerId) => Command {
  return (id) => ({
    print: `player ${id} increment threat by ${amount.print}`,
    do: (s) => {
      s.players.find((p) => p.id === id)!.thread += amount.eval(createView(s));
    },
    result: () => "full",
  });
}

export function chooseCardsForAction(filter: Filter<CardId>, factory: (id: CardId) => Action): Action {
  return {
    print: `choose cards for action: [${factory(0).print}]`,
    do: async (engine) => {
      const view = createView(engine.state);
      const cards = filterCards(filter, view);
      const actions = cards.map((card) => ({
        label: card.props.name || "",
        value: factory(card.id),
        image: card.props.image,
      }));
      await engine.chooseNextActions("Choose cards", actions);
    },
    commands: (s) => {
      const view = createView(s);
      const cards = filterCards(filter, view);
      const actions = cards.map((card) => factory(card.id)).filter((a) => getActionResult(a, s) !== "none");
      const combinations = [...PowerSet.of(actions)] as Action[][];
      return combinations.flatMap((list) => sequence(...list).commands(s));
    },
  };
}

export function chooseAction(title: string, choices: Array<{ label: string; image?: string; value: Action }>): Action {
  return {
    print: `chooseAction: ${choices.map((c) => c.value.print).join(" / ")}`,
    do: async (engine) => {
      await engine.chooseNextAction(title, choices);
    },
    commands: (s) => {
      const valid = choices.filter((c) => getActionResult(c.value, s) !== "none");
      const commands = valid.flatMap((choice) => choice.value.commands(s));
      return commands;
    },
  };
}

export function chooseActions(title: string, choices: Array<{ label: string; image?: string; value: Action }>): Action {
  return {
    print: `chooseActions: ${choices.map((c) => c.value.print).join(" / ")}`,
    do: async (engine) => {
      await engine.chooseNextAction(title, choices);
    },
    commands: (s) => {
      const valid = choices.filter((c) => getActionResult(c.value, s) !== "none");
      const commands = valid.flatMap((choice) => choice.value.commands(s));
      return commands;
    },
  };
}

export function chooseCardForAction2(title: string, filter: Filter<CardId>, factory: (id: CardId) => Action): Action {
  return {
    print: `choose card for action: [${factory(0).print}]`,
    do: async (engine) => {
      const view = createView(engine.state);
      const cards = filterCards(filter, view);
      const actions = cards.map((card) => ({
        label: card.props.name || "",
        value: factory(card.id),
        image: card.props.image,
      }));
      await engine.chooseNextAction(title, actions);
    },
    commands: (s) => {
      const view = createView(s);
      const cards = filterCards(filter, view);
      const actions = cards.map((card) => factory(card.id)).filter((a) => getActionResult(a, s) !== "none");
      const commands = actions.flatMap((action) => action.commands(s));
      return commands;
    },
  };
}

export function filteredCards(filter: Filter<CardId>): Exp<CardView[]> {
  return {
    print: `cards that ${filter(0)}`,
    eval: (v) => filterCards(filter, v),
  };
}

export function chooseCardForAction(title: string, filter: Filter<CardId>, action: CardAction2): Action {
  return bindAction(`choose card for action: [${action.print}]`, filteredCards(filter), (ids) =>
    chooseAction(
      title,
      ids.map((card) => ({
        label: card.props.name || "",
        value: action.action(card.id),
        image: card.props.image,
      }))
    )
  );
}

export function bindAction<T>(print: string, exp: Exp<T>, factory: (value: T) => Action): Action {
  return {
    print,
    do: async (e) => {
      const value = exp.eval(createView(e.state));
      const action = factory(value);
      return await e.do(action);
    },
    commands: (s) => {
      const value = exp.eval(createView(s));
      const action = factory(value);
      return action.commands(s);
    },
  };
}

export function playerActions(title: string): Action {
  return {
    print: "player actions",
    do: async (engine) => {
      await engine.playerActions(title);
    },
    commands: () => [], // TODO commands
  };
}

export function ifThen(condition: Exp<boolean>, action: Action): Action {
  return {
    print: `if ${condition.print} then ${action.print}`,
    do: async (e) => {
      const view = createView(e.state);
      const result = condition.eval(view);
      if (result) {
        await e.do(action);
      }
    },
    commands: () => [],
  };
}

export function phaseTravel(): Action {
  return sequence(
    // TODO allow no travel
    ifThen(
      negate(existsActiveLocation),
      chooseCardForAction("Choose location for travel", isLocation, travelToLocation)
    ),
    playerActions("End phase")
  );
}

export function phaseRefresh(): Action {
  return sequence(
    eachCard(isTapped, ready),
    eachPlayer((p) => action(incrementThreat(lit(1))(p))),
    passFirstPlayerToken,
    playerActions("End phase and round")
  );
}

export function ready(cardId: CardId): Action {
  return action(untap(cardId));
}

export const travelToLocation = cardAction("travel to location", (cardId) =>
  action(moveCard(cardId, zoneKey("stagingArea"), zoneKey("activeLocation"), "face"))
);

export const passFirstPlayerToken: Action = bindAction("pass first player token", nextPlayerId, (next) =>
  action(setFirstPlayer(next))
);

export function phaseEncounter(): Action {
  return sequence(
    eachPlayer(optionalEngagement),
    playerActions("Engagement Checks"),
    whileDo(enemiesToEngage, eachPlayer(engagementCheck)),
    playerActions("Next phase")
  );
}

export function optionalEngagement(player: PlayerId): Action {
  // TODO no engagement
  return chooseCardForAction(
    "Choose enemy to optional engage",
    and(isInZone(zoneKey("stagingArea")), isEnemy),
    engagePlayer(player)
  );
}

export function engagementCheck(player: PlayerId): Action {
  return chooseCardForAction("Choose enemy to engage", withMaxEngagement(player), engagePlayer(player));
}

export function engagePlayer(player: PlayerId): CardAction2 {
  return cardAction(`engage player ${player}`, (cardId) =>
    action(moveCard(cardId, zoneKey("stagingArea"), zoneKey("engaged", player), "face"))
  );
}

export function whileDo(exp: Exp<boolean>, act: Action): Action {
  return {
    print: `while ${exp.print} do ${act.print}`,
    do: async (e) => {
      while (exp.eval(createView(e.state))) {
        await act.do(e);
      }
    },
    //TODO
    commands: () => [],
  };
}

export function resolveEnemyAttacks(playerId: PlayerId) {
  const enemies: Filter<CardId> = and(isEnemy, isInZone(zoneKey("engaged", playerId)));
  return chooseCardActionOrder("Choose enemy attacker", enemies, resolveEnemyAttack(playerId));
}

export function resolveEnemyAttack(playerId: PlayerId): CardAction {
  return (attackerId) => {    
    // TODO shadow effect
    return sequence(
      playerActions("Declare defender"),      
      declareDefender(attackerId, playerId)
    );
  };
}

export function declareDefender(attackerId: CardId, playerId: PlayerId): Action {
  const filter = and((id) => negate(isTapped(id)), isCharacter, isInZone(zoneKey("playerArea", playerId)));
  return {
    print: "declare defender",
    do: async (e) => {
      const view = createView(e.state);
      const cards = filterCards(filter, view);
      const choosen = await e.chooseOne("Declare defender", [
        ...cards.map((c) => ({ label: c.props.name || "", value: c, image: c.props.image })),
        { label: "none", value: undefined },
      ]);

      const action = choosen
        ? cardActionSequence(tapAction, resolveDefense(attackerId)).action(choosen.id)
        : chooseCardForAction(
            "Choose hero for undefended attack",
            and(isHero, isInZone(zoneKey("playerArea", playerId))),
            dealDamage2(getProp("attack", attackerId))
          );

      e.do(action);
    },
    //TODO
    commands: () => [],
  };
}

export const tapAction = cardAction("tap card", (cardId) => action(tap(cardId)));

export function dealDamage(amount: Exp<number>): CardAction {
  return (cardId) => action(repeat(amount, addToken(cardId, "damage")));
}

export function dealDamage2(amount: Exp<number>): CardAction2 {
  return cardAction(`deal ${amount.print} damage`, (cardId) => action(repeat(amount, addToken(cardId, "damage"))));
}

export function resolveDefense(attackerId: CardId): CardAction2 {
  return cardAction(`resolve defense against ${attackerId}`, (defenderId) => {
    const attack = getProp("attack", attackerId);
    const defense = getProp("defense", defenderId);
    const damage = diff(attack, defense);
    return ifThen(isMore(damage, lit(0)), dealDamage(damage)(defenderId));
  });
}

export function chooseCardActionOrder(title: string, filter: Filter<CardId>, action: CardAction): Action {
  return {
    print: `choose card order for cards ${filter(0).print} and action ${action(0).print}`,
    do: async (e) => {
      const used: CardId[] = [];

      while (true) {
        const cards = filterCards(filter, createView(e.state)).filter((c) => !used.includes(c.id));
        if (cards.length === 0) {
          break;
        } else {
          const choosen = await e.chooseOne(
            title,
            cards.map((c) => ({
              label: c.id.toString(),
              value: c.id,
              image: c.props.image,
            }))
          );

          used.push(choosen);
          await e.do(action(choosen));
        }
      }
    },
    //TODO
    commands: () => [],
  };
}

export function resolvePlayerAttacks(playerId: PlayerId) {
  // TODO all
  return sequence();
}

export function dealShadowCards() {
  // TODO all
  return sequence();
}

export function phaseCombat() {
  return sequence(
    dealShadowCards(),
    playerActions("Resolve enemy attacks"),
    eachPlayer(resolveEnemyAttacks),
    playerActions("Resolve player attacks"),
    eachPlayer(resolvePlayerAttacks),
    playerActions("End phase")
  );
}

export function gameRound() {
  return sequence(
    phaseResource(),
    phasePlanning(),
    phaseQuest(),
    phaseTravel(),
    phaseEncounter(),
    phaseCombat(),
    phaseRefresh()
  );
}

export function startGame() {
  // TODO ending condition
  return whileDo(lit(true), gameRound());
}
