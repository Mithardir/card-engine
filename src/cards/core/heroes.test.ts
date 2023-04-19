import { expect, it } from "vitest";
import { GameEngine } from "../../engine/test/GameEngine";
import { dealDamage, heal } from "../../factories/cardActions";
import * as hero from "./heroes";
import { addResources } from "../../factories/actions";

it("Gimli's attack bonus", () => {
  const game = new GameEngine();
  const gimli = game.addHero(hero.gimli);
  expect(gimli.props.attack).toEqual(2);
  gimli.update(dealDamage(1));
  expect(gimli.props.attack).toEqual(3);
  gimli.update(heal(1));
  expect(gimli.props.attack).toEqual(2);
});

it("Glorfindel's action", async () => {
  const game = new GameEngine();
  const glorfindel = game.addHero(hero.glorfindel);
  expect(game.actions.length).toEqual(0);
  glorfindel.update(addResources(1));
  expect(game.actions.length).toEqual(0);
  glorfindel.update(dealDamage(1));
  expect(game.actions.length).toEqual(1);
  game.do(game.actions[0].action);
  expect(glorfindel.token.resources).toEqual(0);
  expect(glorfindel.token.damage).toEqual(0);
  expect(game.actions.length).toEqual(0);
});

// it("Gloin's resource generator", async () => {
//   const game = new GameEngine({ choices: [0] });
//   const gloin = game.addHero(hero.gloin);
//   expect(gloin.get.resources).toEqual(0);
//   expect(game.view.responses.receivedDamage.length).toEqual(1);
//   await gloin.receiveDamage(2, []);
//   expect(gloin.get.resources).toEqual(2);
// });

// it("Beravor's card drawing action", async () => {
//   const game = createGame();
//   const player = game.addPlayer();
//   const beravor = game.addCard("core", "beravor", player.playerArea);
//   game.addCard("core", "veteranAxehand", player.library);
//   game.addCard("core", "veteranAxehand", player.library);
//   const action = () => beravor.playerActions[0];
//   expect(player.hand.cards.length).toEqual(0);
//   expect(action().canDo).toEqual(true);
//   await action().do();
//   expect(player.hand.cards.length).toEqual(2);
//   expect(action().canDo).toEqual(false);
//   beravor.ready();
//   expect(action().canDo).toEqual(false);
//   game.endTurn();
//   game.addCard("core", "veteranAxehand", player.library);
//   expect(action().canDo).toEqual(true);
// });

// it("Eowyns bonus will", async () => {
//   const game = createGame([0, 0]);
//   const player1 = game.addPlayer();
//   const player2 = game.addPlayer();
//   const eowyn = game.addCard("core", "eowyn", player1.playerArea);
//   game.addCard("core", "veteranAxehand", player1.hand);
//   game.addCard("core", "veteranAxehand", player1.hand);
//   game.addCard("core", "veteranAxehand", player2.hand);

//   expect(eowyn.current.willpower).toEqual(4);
//   expect(eowyn.playerActions.filter(a => a.canDo).length).toEqual(2);

//   await eowyn.playerActions.find(a => a.player === player1)!.do();
//   expect(eowyn.current.willpower).toEqual(5);
//   expect(eowyn.playerActions.filter(a => a.canDo).length).toEqual(1);

//   await eowyn.playerActions.find(a => a.player === player2)!.do();
//   expect(eowyn.current.willpower).toEqual(6);
//   expect(eowyn.playerActions.filter(a => a.canDo).length).toEqual(0);

//   await game.endPhase();
//   expect(eowyn.current.willpower).toEqual(4);
//   await game.endTurn();
//   expect(eowyn.playerActions.filter(a => a.canDo).length).toEqual(1);
// });

// it("Lelogas placing progress", async () => {
//   const game = new GameEngine({ choices: [0] });
//   const legolas = game.addHero(hero.legolas);
//   const enemy = game.addEnemy(dolGuldurOrcs);
//   const location = game.addLocation(mountainsOfMirkwood);
//   await game.execute(destroy(enemy.id, [legolas.id]));
//   expect(location.get.progress).toEqual(2);
// });

// it("Thalin damaging enemies", async () => {
//   const game = new GameEngine({ choices: [0] });
//   const thalin = game.addHero(hero.thalin);
//   await game.execute(startPhase("quest"));
//   game.update((s) => {
//     if (s.phase.type === "quest") {
//       s.phase.comitted.push(thalin.id);
//     }
//   });
//   const enemy = game.addEncounterCard(dolGuldurOrcs);
//   await game.execute(revealEncounterCards(1));
//   expect(enemy.get.damage).toEqual(1);
// });
