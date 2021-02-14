import { Card } from "../../../engine/state";
import { treachery } from "../../definitions/treachery";

export const eyesOfTheForest: Card = () => treachery({ name: "Eyes of the Forest" });

export const caughtInAWeb: Card = () => treachery({ name: "Caught in a Web" });

export const drivenByShadow: Card = () => treachery({ name: "Driven by Shadow" });

export const theNecromancersReach: Card = () =>
  treachery({
    name: "The Necromancer's Reach",
  });
