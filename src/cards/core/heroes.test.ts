import { expect, it } from "vitest";
import { createState } from "../../engine/createState";
import { advanceToChoiceState } from "../../engine/updates/advanceToChoiceState";
import { toView } from "../../engine/view/toView";
import { beginScenario } from "../../factories/actions";
import { gimli } from "./heroes";

it("gimli ability", async () => {
  const state = createState(
    beginScenario(
      {
        name: "gimliTest",
        questCards: [],
        encounterCards: [],
      },
      { heroes: [gimli], library: [], name: "test" }
    )
  );
  advanceToChoiceState(state);

  state.cards[1].token.damage += 5;
  const view = toView(state);
  expect(view.cards[1].props.attack).toBe(7);
});
