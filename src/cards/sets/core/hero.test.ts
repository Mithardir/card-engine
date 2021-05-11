import { addToken, removeToken, tap } from "../../../engine/actions/card";
import { addPlayer } from "../../../engine/actions/game";
import { createTestEngine } from "../../../tests/utils";
import * as hero from "./heroes";
import * as ally from "./allies";
import { createCardState, createInitState } from "../../../engine/state";
import { draw, payResources } from "../../../engine/actions/player";
import { createView } from "../../../engine/view";
import { sequence } from "../../../engine/actions/control";

it("Gimli's attack bonus", () => {
  const engine = createTestEngine();
  const gimli = engine.addHero(hero.gimli);
  expect(gimli.attack).toEqual(2);
  engine.do(addToken("damage")(gimli.id));
  expect(gimli.attack).toEqual(3);
  engine.do(removeToken("damage")(gimli.id));
  expect(gimli.attack).toEqual(2);
});

it("Pay test", async () => {
  let state = createInitState();

  // state.cards.push(createCardState(1, hero.gimli, "face"));
  state = addPlayer("A", { heroes: [hero.gimli], library: [], name: "X" }).do(state).state;
  state = addToken("resources")(1).do(state).state;
  state = addToken("resources")(1).do(state).state;
  //state = draw(1)("A").do(state).state;

  console.log(state.cards);

  console.log(payResources(2, "tactics")("A").do(state).next);

  console.log(tap(1).do(state).effect);
  console.log(sequence(tap(1), tap(1)).do(state).effect);
  state = tap(1).do(state).state;
  console.log(tap(1).do(state).effect);
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
