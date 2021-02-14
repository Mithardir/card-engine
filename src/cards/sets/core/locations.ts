import { Card } from "../../../engine/state";
import { location } from "../../definitions/location";

export const greatForestWeb: Card = () =>
  location({
    name: "Great Forest Web",
    threat: 2,
    questPoints: 2,
    traits: ["forest"],
  });

export const oldForestRoad: Card = () =>
  location({ name: "Old Forest Road", threat: 1, questPoints: 3, traits: ["forest"] });

export const forestGate: Card = () => location({ name: "Forest Gate", threat: 2, questPoints: 4, traits: ["forest"] });

export const mountainsOfMirkwood: Card = () =>
  location({
    name: "Mountains of Mirkwood",
    threat: 2,
    questPoints: 3,
    traits: ["forest", "mountain"],
  });

export const necromancersPass: Card = () =>
  location({
    name: "Necromancer's Pass",
    threat: 3,
    questPoints: 2,
    traits: ["stronghold", "dolGuldur"],
  });

export const enchantedStream: Card = () =>
  location({ name: "Enchanted Stream", threat: 2, questPoints: 2, traits: ["forest"] });
