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
  game.addToLibrary(ally.veteranAxehand);
  expect(game.actions.length).toEqual(0);
  game.do("EndRound");
  expect(game.actions.length).toEqual(1);
});

it("Eowyns bonus will", async () => {
  const game = new GameEngine();
  const player1 = game.addPlayer();
  const player2 = game.addPlayer();
  const eowyn = game.addHero(hero.eowyn);
  game.addToHand(ally.veteranAxehand, player1);
  game.addToHand(ally.veteranAxehand, player1);
  game.addToHand(ally.veteranAxehand, player2);
  expect(eowyn.props.willpower).toEqual(4);
  expect(game.actions.length).toEqual(1);
  game.doAction(
    "Discard 1 card from your hand to give Éowyn +1 [willpower] until the end of the phase. This effect may be triggered by each player once each round."
  );
  expect(eowyn.props.willpower).toEqual(5);
  expect(game.actions.length).toEqual(1);
  game.doAction("XXX");
  expect(eowyn.props.willpower).toEqual(6);
  expect(game.actions.length).toEqual(0);
  game.do("EndPhase");
  expect(eowyn.props.willpower).toEqual(4);
  game.do("EndRound");
  expect(game.actions.length).toEqual(1);
});

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
