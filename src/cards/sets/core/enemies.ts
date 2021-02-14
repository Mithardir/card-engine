import { Card } from "../../../engine/state";
import { enemy } from "../../definitions/enemy";

export const kingSpider: Card = () =>
  enemy({
    name: "King Spider",
    engagement: 20,
    threat: 2,
    attack: 3,
    defense: 1,
    hitPoints: 3,
    traits: ["creature", "spider"],
  });

export const forestSpider: Card = () =>
  enemy({
    name: "Forest Spider",
    engagement: 25,
    threat: 2,
    attack: 2,
    defense: 1,
    hitPoints: 4,
    traits: ["creature", "spider"],
  });

export const ungoliantsSpawn: Card = () =>
  enemy({
    name: "Ungoliant's Spawn",
    engagement: 32,
    threat: 3,
    attack: 5,
    defense: 2,
    hitPoints: 9,
    traits: ["creature", "spider"],
  });

export const dolGuldurOrcs: Card = () =>
  enemy({
    name: "Dol Guldur Orcs",
    engagement: 10,
    threat: 2,
    attack: 2,
    defense: 0,
    hitPoints: 3,
    traits: ["dolGuldur", "orc"],
  });

export const chieftanUfthak: Card = () =>
  enemy({
    name: "Chieftan Ufthak",
    engagement: 35,
    threat: 2,
    attack: 3,
    defense: 3,
    hitPoints: 6,
    victory: 4,
    traits: ["dolGuldur", "orc"],
  });

export const dolGuldurBeastmaster: Card = () =>
  enemy({
    name: "Dol Guldur Beastmaster",
    engagement: 35,
    threat: 2,
    attack: 3,
    defense: 1,
    hitPoints: 5,
    traits: ["dolGuldur", "orc"],
  });

export const eastBightPatrol: Card = () =>
  enemy({
    name: "East Bight Patrol",
    engagement: 5,
    threat: 3,
    attack: 3,
    defense: 1,
    hitPoints: 2,
    traits: ["goblin", "orc"],
  });

export const blackForestBats: Card = () =>
  enemy({
    name: "Black Forest Bats",
    engagement: 15,
    threat: 1,
    attack: 1,
    defense: 0,
    hitPoints: 2,
    traits: ["creature"],
  });

export const hummerhorns: Card = () =>
  enemy({
    name: "Hummerhorns",
    engagement: 40,
    threat: 1,
    attack: 2,
    defense: 0,
    hitPoints: 3,
    victory: 5,
    traits: ["creature", "insect"],
  });

export const easternCrows: Card = () =>
  enemy({
    name: "Eastern Crows",
    engagement: 30,
    threat: 1,
    attack: 1,
    defense: 0,
    hitPoints: 1,
    traits: ["creature"],
  });
