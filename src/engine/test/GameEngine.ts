import { createState } from "../../engine/createState";
import { addCard } from "../../engine/updates/addCard";
import { advanceToChoiceState } from "../../engine/updates/advanceToChoiceState";
import { beginScenario } from "../../factories/actions";
import { playerZone } from "../../factories/zones";
import { CardDefinition } from "../../types/cards";
import { CardProxy } from "./CardProxy";

export class GameEngine {
  constructor(
    private state = createState(
      beginScenario(
        { name: "TEST", encounterCards: [], questCards: [] },
        { name: "TEST", heroes: [], library: [] }
      )
    )
  ) {
    advanceToChoiceState(state);
  }

  addHero(hero: CardDefinition): CardProxy {
    const id = addCard(this.state, hero, "face", playerZone("A", "playerArea"));
    return new CardProxy(this.state, id);
  }
}
