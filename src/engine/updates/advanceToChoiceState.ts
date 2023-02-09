import { State } from "../../types/state";
import { nextStep } from "./nextStep";

export function advanceToChoiceState(
  state: State,
  onError?: (error: string) => void
) {
  while (true) {
    if (state.next.length === 0) {
      return;
    }

    if (state.choice) {
      return state;
    }

    try {
      nextStep(state);
    } catch (error) {
      if (onError) {
        onError(error.message);
      } else {
        throw error;
      }
    }
  }
}
