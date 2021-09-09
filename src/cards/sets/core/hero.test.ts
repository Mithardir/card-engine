import {
  addToken,
  dealDamage,
  mark,
  processResponses,
  removeToken,
} from "../../../engine/actions/card";
import {
  bind as bindAction,
  repeat,
  sequence,
} from "../../../engine/actions/control";
import {
  beginPhase,
  moveTopCard,
  revealEncounterCard,
  revealTopCard,
} from "../../../engine/actions/game";
import { bind } from "../../../engine/actions/modifiers";
import { getTopCard } from "../../../engine/exps";
import { zoneKey } from "../../../engine/utils";
import { createTestEngine } from "../../../tests/utils";
import { dolGuldurOrcs } from "./enemies";
import * as hero from "./heroes";
import { fliesAndSpiders } from "./quests";

it("Gimli's attack bonus", () => {
  const engine = createTestEngine();
  const gimli = engine.addHero(hero.gimli);
  expect(gimli.attack).toEqual(2);
  engine.do(addToken("damage")(gimli.id));
  expect(gimli.attack).toEqual(3);
  engine.do(removeToken("damage")(gimli.id));
  expect(gimli.attack).toEqual(2);
});

it("Lelogas placing progress", async () => {
  const game = createTestEngine();
  const legolas = game.addHero(hero.legolas);
  const enemy = game.addEnemy(dolGuldurOrcs);
  const quest = game.addQuest(fliesAndSpiders);
  game.do(dealDamage(3, [legolas.id])(enemy.id), [
    "After Legolas participates in an attack that destroys an enemy, place 2 progress tokens on the current quest.",
  ]);
  expect(quest.progress).toEqual(2);
});

it("Thalin damaging enemies", async () => {
  const game = createTestEngine();
  const thalin = game.addHero(hero.thalin);
  game.do(beginPhase("quest"));
  game.do(mark("questing")(thalin.id));
  const enemy = game.addEncounterCard(dolGuldurOrcs);
  game.do(revealEncounterCard, [
    "While Thalin is committed to a quest, deal 1 damage to each enemy as it is revealed by the encounter deck.",
  ]);
  expect(enemy.damage).toEqual(1);
});

// it("Glorfindel's action", async () => {
//   const game = new GameEngine({ choices: [0] });
//   const gimli = game.addHero(hero.gimli);
//   const glorfindel = game.addHero(hero.glorfindel);
//   gimli.update(addToken("damage", 2));
//   glorfindel.update(addToken("resources", 2));
//   expect(glorfindel.actions[0].enabled).toEqual(true);
//   await glorfindel.actions[0].do();
//   expect(glorfindel.get.resources).toEqual(1);
//   expect(gimli.get.damage).toEqual(1);
//   expect(glorfindel.actions[0].enabled).toEqual(false);
//   await game.execute(endRound());
//   expect(glorfindel.actions[0].enabled).toEqual(true);
// });

// it("Gloin's resource generator", async () => {
//   const game = new GameEngine({ choices: [0] });
//   const gloin = game.addHero(hero.gloin);
//   expect(gloin.get.resources).toEqual(0);
//   expect(game.view.responses.receivedDamage.length).toEqual(1);
//   await gloin.receiveDamage(2, []);
//   expect(gloin.get.resources).toEqual(2);
// });

// // it("Beravor's card drawing action", async () => {
// //   const game = createGame();
// //   const player = game.addPlayer();
// //   const beravor = game.addCard("core", "beravor", player.playerArea);
// //   game.addCard("core", "veteranAxehand", player.library);
// //   game.addCard("core", "veteranAxehand", player.library);
// //   const action = () => beravor.playerActions[0];
// //   expect(player.hand.cards.length).toEqual(0);
// //   expect(action().canDo).toEqual(true);
// //   await action().do();
// //   expect(player.hand.cards.length).toEqual(2);
// //   expect(action().canDo).toEqual(false);
// //   beravor.ready();
// //   expect(action().canDo).toEqual(false);
// //   game.endTurn();
// //   game.addCard("core", "veteranAxehand", player.library);
// //   expect(action().canDo).toEqual(true);
// // });

// // it("Eowyns bonus will", async () => {
// //   const game = createGame([0, 0]);
// //   const player1 = game.addPlayer();
// //   const player2 = game.addPlayer();
// //   const eowyn = game.addCard("core", "eowyn", player1.playerArea);
// //   game.addCard("core", "veteranAxehand", player1.hand);
// //   game.addCard("core", "veteranAxehand", player1.hand);
// //   game.addCard("core", "veteranAxehand", player2.hand);

// //   expect(eowyn.current.willpower).toEqual(4);
// //   expect(eowyn.playerActions.filter(a => a.canDo).length).toEqual(2);

// //   await eowyn.playerActions.find(a => a.player === player1)!.do();
// //   expect(eowyn.current.willpower).toEqual(5);
// //   expect(eowyn.playerActions.filter(a => a.canDo).length).toEqual(1);

// //   await eowyn.playerActions.find(a => a.player === player2)!.do();
// //   expect(eowyn.current.willpower).toEqual(6);
// //   expect(eowyn.playerActions.filter(a => a.canDo).length).toEqual(0);

// //   await game.endPhase();
// //   expect(eowyn.current.willpower).toEqual(4);
// //   await game.endTurn();
// //   expect(eowyn.playerActions.filter(a => a.canDo).length).toEqual(1);
// // });
