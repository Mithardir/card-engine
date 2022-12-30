import {
  beorn,
  gondorianSpearman,
  horsebackArcher,
  veteranAxehand,
  gandalf,
} from "../cards/core/allies";
import {
  bladeOfGondolin,
  citadelPlate,
  dwarvenAxe,
  hornOfGondor,
} from "../cards/core/attachments";
import {
  bladeMastery,
  feint,
  quickStrike,
  rainOfArrows,
  standTogether,
  swiftStrike,
  thicketOfSpears,
} from "../cards/core/events";
import { legolas, thalin, gimli } from "../cards/core/heroes";
import { PlayerDeck } from "../types/basic";

export const coreTactics: PlayerDeck = {
  name: "Core (Tactics)",
  heroes: [legolas, thalin, gimli],
  library: [
    beorn,
    gondorianSpearman,
    gondorianSpearman,
    gondorianSpearman,
    horsebackArcher,
    horsebackArcher,
    veteranAxehand,
    veteranAxehand,
    veteranAxehand,
    bladeOfGondolin,
    bladeOfGondolin,
    citadelPlate,
    citadelPlate,
    dwarvenAxe,
    dwarvenAxe,
    hornOfGondor,
    bladeMastery,
    bladeMastery,
    bladeMastery,
    feint,
    feint,
    quickStrike,
    quickStrike,
    rainOfArrows,
    rainOfArrows,
    standTogether,
    swiftStrike,
    thicketOfSpears,
    thicketOfSpears,
    gandalf,
    gandalf,
    gandalf,
  ],
};
