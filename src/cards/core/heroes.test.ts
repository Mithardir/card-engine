import { expect, it } from "vitest";
import { GameEngine } from "../../engine/test/GameEngine";
import { dealDamage, heal } from "../../factories/cardActions";
import * as hero from "./heroes";
import * as ally from "./allies";
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

it("Glorfindel's action", () => {
  const game = new GameEngine();
  const glorfindel = game.addHero(hero.glorfindel);
  expect(game.actions.length).toEqual(0);
  glorfindel.update(addResources(1));
  expect(game.actions.length).toEqual(0);
  glorfindel.update(dealDamage(1));
  expect(game.actions.length).toEqual(1);
  game.doAction(
    "Pay 1 resource from Glorfindel's pool to heal 1 damage on any character. (Limit once per round.)"
  );
  expect(glorfindel.token.resources).toEqual(0);
  expect(glorfindel.token.damage).toEqual(0);
  expect(game.actions.length).toEqual(0);
});

it("Gloin's resource generator", () => {
  const game = new GameEngine();
  const gloin = game.addHero(hero.gloin);
  expect(gloin.token.resources).toEqual(0);
  expect(gloin.responses.receivedDamage.length).toEqual(1);
  gloin.update(dealDamage(2));
  expect(game.state.choice?.title).toBe("Choose response for dealing damage");
  game.chooseOption(
    "After Glóin suffers damage, add 1 resource to his resource pool for each point of damage he just suffered."
  );
  expect(gloin.token.resources).toEqual(2);
});

it("Beravor's card drawing action", () => {
  const game = new GameEngine();
  const player = game.addPlayer();
  const beravor = game.addHero(hero.beravor);
  game.addToLibrary(ally.veteranAxehand);
  game.addToLibrary(ally.veteranAxehand);
  expect(player.hand.cards.length).toEqual(0);
  expect(game.actions.length).toEqual(1);
  game.doAction(
    "Exhaust Beravor to choose a player. That player draws 2 cards. Limit once per round."
  );
  expect(player.hand.cards.length).toEqual(2);
  expect(game.actions.length).toEqual(0);
  beravor.update("Ready");
  expect(game.actions.length).toEqual(0);
  game.do("EndRound");
  game.addToLibrary(ally.veteranAxehand);
  expect(game.actions.length).toEqual(1);
});

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
